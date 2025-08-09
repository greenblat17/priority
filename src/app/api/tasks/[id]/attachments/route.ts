import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseService } from '@/lib/supabase/service'
import { randomUUID } from 'crypto'

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const supabase = await createClient()

    // Auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Validate task ownership
    const { data: task } = await supabase
      .from('tasks')
      .select('id,user_id')
      .eq('id', id)
      .single()
    if (!task || task.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Parse multipart form-data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file)
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })

    const fileExt = file.name.split('.').pop() || 'bin'
    const objectName = `${user.id}/${id}/${randomUUID()}.${fileExt}`

    // Upload to Storage bucket
    const { data: uploaded, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(objectName, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })
    if (uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })

    // Save DB row
    const { data: attachment, error: insertError } = await supabase
      .from('task_attachments')
      .insert({
        task_id: id,
        user_id: user.id,
        file_name: file.name,
        content_type: file.type || null,
        size_bytes: file.size,
        storage_path: uploaded.path,
      })
      .select()
      .single()
    if (insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })

    return NextResponse.json(attachment)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get('attachmentId')
    if (!attachmentId)
      return NextResponse.json(
        { error: 'Missing attachmentId' },
        { status: 400 }
      )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch row and validate ownership
    const { data: row, error } = await supabase
      .from('task_attachments')
      .select('id,user_id,storage_path,task_id')
      .eq('id', attachmentId)
      .single()
    if (error || !row || row.user_id !== user.id || row.task_id !== id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await supabase.storage.from('task-attachments').remove([row.storage_path])
    await supabase.from('task_attachments').delete().eq('id', row.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Delete failed' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    // Use service role to reliably sign URLs regardless of bucket visibility
    const { data, error } = await supabaseService
      .from('task_attachments')
      .select('*')
      .eq('task_id', id)
      .order('created_at', { ascending: false })
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    let rows = data || []

    // If DB rows are empty, list storage by prefix user_id/task_id
    if (rows.length === 0) {
      const { data: taskRow, error: taskErr } = await supabaseService
        .from('tasks')
        .select('id,user_id')
        .eq('id', id)
        .single()
      if (!taskErr && taskRow) {
        const prefix = `${taskRow.user_id}/${id}`
        const { data: list } = await supabaseService.storage
          .from('task-attachments')
          .list(prefix)
        if (list && list.length) {
          rows = list.map((obj: any) => ({
            id: obj.id || `${prefix}/${obj.name}`,
            task_id: id,
            user_id: taskRow.user_id,
            file_name: obj.name,
            content_type: obj.metadata?.mimetype ?? null,
            size_bytes: obj.metadata?.size ?? null,
            storage_path: `${prefix}/${obj.name}`,
            created_at: obj.created_at || new Date().toISOString(),
          }))
        }
      }
    }

    const withUrls = await Promise.all(
      rows.map(async (att: any) => {
        const { data: signed } = await supabaseService.storage
          .from('task-attachments')
          .createSignedUrl(att.storage_path, 60 * 10)
        return { ...att, url: signed?.signedUrl || '' }
      })
    )
    return NextResponse.json(withUrls)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to load attachments' },
      { status: 500 }
    )
  }
}
