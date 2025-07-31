import { 
  Building, 
  Send, 
  MessageSquare, 
  Mail, 
  Youtube, 
  Twitter, 
  Smartphone,
  Play
} from 'lucide-react'
import { TaskSource } from '@/types/task'

export const sourceIcons = {
  [TaskSource.INTERNAL]: Building,
  [TaskSource.TELEGRAM]: Send,
  [TaskSource.REDDIT]: MessageSquare,
  [TaskSource.MAIL]: Mail,
  [TaskSource.YOUTUBE]: Youtube,
  [TaskSource.TWITTER]: Twitter,
  [TaskSource.APP_STORE]: Smartphone,
  [TaskSource.GOOGLE_PLAY]: Play,
} as const

export const sourceLabels = {
  [TaskSource.INTERNAL]: 'Internal',
  [TaskSource.TELEGRAM]: 'Telegram',
  [TaskSource.REDDIT]: 'Reddit',
  [TaskSource.MAIL]: 'Mail',
  [TaskSource.YOUTUBE]: 'YouTube',
  [TaskSource.TWITTER]: 'Twitter',
  [TaskSource.APP_STORE]: 'App Store',
  [TaskSource.GOOGLE_PLAY]: 'Google Play',
} as const

export function getSourceIcon(source: string) {
  return sourceIcons[source as keyof typeof sourceIcons] || Building
}

export function getSourceLabel(source: string) {
  return sourceLabels[source as keyof typeof sourceLabels] || source
}