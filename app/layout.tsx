import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import '@insforge/react/styles'
import './globals.css'

export const metadata: Metadata = {
  title: '记账应用',
  description: '跨平台记账应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  )
}
