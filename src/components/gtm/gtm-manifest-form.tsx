'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Plus, X, Globe } from 'lucide-react'
import type { GTMManifest } from '@/types/gtm'

// Validation schema
const gtmManifestSchema = z.object({
  product_name: z.string().min(1, 'Product name is required').max(100),
  product_description: z.string().max(500).optional(),
  target_audience: z.string().max(500).optional(),
  value_proposition: z.string().max(500).optional(),
  current_stage: z.enum(['idea', 'mvp', 'growth', 'scale']).optional(),
  business_model: z.string().max(500).optional(),
  tech_stack: z.object({
    frontend: z.array(z.string()).optional(),
    backend: z.array(z.string()).optional(),
    database: z.array(z.string()).optional(),
    infrastructure: z.array(z.string()).optional(),
  }).optional(),
})

type GTMManifestFormData = z.infer<typeof gtmManifestSchema>

interface GTMManifestFormProps {
  mode: 'onboarding' | 'settings'
  initialData?: GTMManifest
}

export function GTMManifestForm({ mode, initialData }: GTMManifestFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importing, setImporting] = useState(false)
  const [techStackInput, setTechStackInput] = useState({
    frontend: '',
    backend: '',
    database: '',
    infrastructure: '',
  })

  const form = useForm<GTMManifestFormData>({
    resolver: zodResolver(gtmManifestSchema),
    defaultValues: {
      product_name: initialData?.product_name || '',
      product_description: initialData?.product_description || '',
      target_audience: initialData?.target_audience || '',
      value_proposition: initialData?.value_proposition || '',
      current_stage: initialData?.current_stage || undefined,
      business_model: initialData?.business_model || '',
      tech_stack: initialData?.tech_stack || {
        frontend: [],
        backend: [],
        database: [],
        infrastructure: [],
      },
    },
  })

  // Calculate progress
  const calculateProgress = () => {
    const values = form.getValues()
    const fields = [
      values.product_name,
      values.product_description,
      values.target_audience,
      values.value_proposition,
      values.current_stage,
      values.business_model,
    ]
    const filledFields = fields.filter(field => field && field.length > 0).length
    return Math.round((filledFields / fields.length) * 100)
  }

  const [progress, setProgress] = useState(calculateProgress())

  // Update progress when form values change
  useEffect(() => {
    const subscription = form.watch(() => {
      setProgress(calculateProgress())
    })
    return () => subscription.unsubscribe()
  }, [form])

  const addTechStackItem = (category: keyof typeof techStackInput) => {
    const value = techStackInput[category].trim()
    if (value) {
      const currentStack = form.getValues('tech_stack') || {}
      const currentItems = (currentStack as any)[category] || []
      if (!currentItems.includes(value)) {
        form.setValue(`tech_stack.${category}`, [...currentItems, value])
        setTechStackInput({ ...techStackInput, [category]: '' })
      }
    }
  }

  const removeTechStackItem = (category: string, item: string) => {
    const currentStack = form.getValues('tech_stack') || {}
    const currentItems = (currentStack as any)[category] || []
    form.setValue(
      `tech_stack.${category}` as any,
      currentItems.filter(i => i !== item)
    )
  }

  const onSubmit = async (data: GTMManifestFormData) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to continue')
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('gtm_manifests')
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success(
        mode === 'onboarding' 
          ? 'GTM context created successfully!' 
          : 'GTM context updated successfully!'
      )

      if (mode === 'onboarding') {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error saving GTM manifest:', error)
      toast.error('Failed to save GTM context')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importUrl) {
      toast.error('Please enter a URL')
      return
    }

    setImporting(true)
    try {
      const response = await fetch('/api/gtm-manifest/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import from URL')
      }

      // Update form with imported data
      if (data.manifest) {
        const manifest = data.manifest
        form.setValue('product_name', manifest.product_name || '')
        form.setValue('product_description', manifest.product_description || '')
        form.setValue('target_audience', manifest.target_audience || '')
        form.setValue('value_proposition', manifest.value_proposition || '')
        form.setValue('current_stage', manifest.current_stage || undefined)
        form.setValue('business_model', manifest.business_model || '')
        
        if (manifest.tech_stack) {
          form.setValue('tech_stack', manifest.tech_stack)
        }
      }

      toast.success('Successfully imported data from landing page!')
      setShowImportDialog(false)
      setImportUrl('')
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to import from URL')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>
                {mode === 'onboarding' ? 'Set Up Your GTM Context' : 'Update GTM Context'}
              </CardTitle>
              <CardDescription className="mt-2">
                Help our AI understand your business to make better prioritization decisions
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="ml-4"
            >
              <Globe className="mr-2 h-4 w-4" />
              Import from Landing Page
            </Button>
          </div>
          {mode === 'onboarding' && (
            <div className="flex items-center gap-2 mt-4">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Product Name */}
          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="TaskPriority AI" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  What's your product called?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product Description */}
          <FormField
            control={form.control}
            name="product_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="AI-powered task management for solo founders..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Briefly describe what your product does
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target Audience */}
          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Solo founders and indie hackers building SaaS products..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Who is your ideal customer?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Value Proposition */}
          <FormField
            control={form.control}
            name="value_proposition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value Proposition</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Save 10 hours per week by automating task prioritization..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What unique value do you provide?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current Stage */}
          <FormField
            control={form.control}
            name="current_stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stage</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your current stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="idea">Idea Stage</SelectItem>
                    <SelectItem value="mvp">MVP Stage</SelectItem>
                    <SelectItem value="growth">Growth Stage</SelectItem>
                    <SelectItem value="scale">Scale Stage</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Where is your product in its journey?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Model */}
          <FormField
            control={form.control}
            name="business_model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Model</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="B2B SaaS with monthly subscriptions ($49-$99/month)..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  How does your business make money?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tech Stack */}
          <div className="space-y-4">
            <FormLabel>Tech Stack</FormLabel>
            <FormDescription>
              Add the technologies you're using (optional)
            </FormDescription>
            
            {(['frontend', 'backend', 'database', 'infrastructure'] as const).map((category) => (
              <div key={category} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Add ${category} tech...`}
                    value={techStackInput[category]}
                    onChange={(e) => setTechStackInput({
                      ...techStackInput,
                      [category]: e.target.value
                    })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTechStackItem(category)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => addTechStackItem(category)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.watch(`tech_stack.${category}`) || []).map((item) => (
                    <Badge key={item} variant="secondary" className="gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeTechStackItem(category, item)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          {mode === 'onboarding' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Skip for Now
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={loading}
            className={mode === 'settings' ? 'ml-auto' : ''}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'onboarding' ? 'Complete Setup' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>

      {/* Import from URL Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from Landing Page</DialogTitle>
            <DialogDescription>
              Enter your landing page URL and we'll automatically extract your product information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="import-url" className="text-sm font-medium">
                Landing Page URL
              </label>
              <Input
                id="import-url"
                type="url"
                placeholder="https://example.com"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !importing) {
                    handleImport()
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              We'll analyze your page and extract product details, target audience, value proposition, and more.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={importing || !importUrl}
            >
              {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  )
}