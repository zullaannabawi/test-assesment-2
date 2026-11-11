import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/shared/presentation/store/provider'
import { TopBar } from '@/shared/presentation/components/organisms/top-bar'

export const metadata: Metadata = {
  title: 'Members Directory — MemberCore',
  description: 'Manage your organization team members, roles, and workspace access.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <TopBar />
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
