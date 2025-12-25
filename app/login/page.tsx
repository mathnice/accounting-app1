'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await response.json()

      if (data.success) {
        localStorage.setItem('insforge-auth-token', data.data.token)
        message.success('登录成功')
        router.push('/dashboard')
      } else {
        message.error(data.error?.message || '登录失败')
      }
    } catch (error) {
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1>记账应用</h1>
          <p style={{ color: '#666' }}>欢迎回来</p>
        </div>

        <Form onFinish={handleLogin} autoComplete="off">
          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#666' }}>还没有账号？</span>
            <a onClick={() => router.push('/register')} style={{ marginLeft: 8 }}>
              立即注册
            </a>
          </div>
        </Form>
      </Card>
    </div>
  )
}
