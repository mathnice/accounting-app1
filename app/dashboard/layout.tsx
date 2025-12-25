'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Layout, Menu, Button, message } from 'antd'
import {
  HomeOutlined,
  TransactionOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  AccountBookOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { ReactNode } from 'react'

const { Header, Sider, Content } = Layout

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('insforge-auth-token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('insforge-auth-token')
    message.success('已退出登录')
    router.push('/login')
  }

  const menuItems = [
    { key: '/dashboard', icon: <HomeOutlined />, label: '首页' },
    { key: '/dashboard/transactions', icon: <TransactionOutlined />, label: '交易记录' },
    { key: '/dashboard/statistics', icon: <BarChartOutlined />, label: '统计分析' },
    { key: '/dashboard/categories', icon: <AppstoreOutlined />, label: '分类管理' },
    { key: '/dashboard/accounts', icon: <AccountBookOutlined />, label: '账户管理' },
    { key: '/dashboard/profile', icon: <UserOutlined />, label: '个人资料' },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{
          height: 32,
          margin: 16,
          color: '#fff',
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          {collapsed ? '记' : '记账'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        }}>
          <h2 style={{ margin: 0 }}>记账应用</h2>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
