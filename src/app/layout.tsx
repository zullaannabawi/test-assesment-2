import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/shared/presentation/store/provider'

export const metadata: Metadata = {
  title: 'Member Dashboard — MemberCore',
  description: 'Manage your organization team members, roles, and workspace access.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
