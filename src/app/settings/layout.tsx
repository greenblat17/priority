'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FileText, Key } from 'lucide-react'

const settingsNavItems = [
  {
    href: '/settings/gtm',
    label: 'GTM Manifest',
    icon: FileText,
    description: 'Configure your Go-to-Market context',
  },
  {
    href: '/settings/api-keys',
    label: 'API Keys',
    icon: Key,
    description: 'Manage API keys for MCP servers',
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Settings Navigation */}
        <nav className="w-64 shrink-0">
          <ul className="space-y-1">
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-start gap-3 rounded-lg px-3 py-2 transition-colors',
                      isActive
                        ? 'bg-gray-100 text-foreground'
                        : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}