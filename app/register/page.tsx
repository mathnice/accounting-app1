'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRegister = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await response.json()

      if (data.success) {
        message.success('注册成功')
        router.push('/login')
      } else {
        message.error(data.error?.message || '注册失败')
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
          <p style={{ color: '#666' }}>创建新账号</p>
        </div>

        <Form onFinish={handleRegister} autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码（至少6位）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
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
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#666' }}>已有账号？</span>
            <a onClick={() => router.push('/login')} style={{ marginLeft: 8 }}>
              立即登录
            </a>
          </div>
        </Form>
      </Card>
    </div>
  )
}
