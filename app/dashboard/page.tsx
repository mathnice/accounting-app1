'use client'

import { useState } from 'react'
import { Card, Row, Col, Statistic, Input, Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getAIService } from '@/lib/ai/AIServiceFactory'

const { TextArea } = Input

export default function DashboardPage() {
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsedResult, setParsedResult] = useState<any>(null)

  const handleParse = async () => {
    if (!inputText.trim()) {
      message.warning('请输入内容')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })
      const data = await response.json()

      if (data.success) {
        setParsedResult(data.data)
        message.success('解析成功')
      } else {
        message.error(data.error?.message || '解析失败')
      }
    } catch (error) {
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>首页</h1>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="本月收入" value={0} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="本月支出" value={0} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="结余" value={0} precision={2} prefix="¥" />
          </Card>
        </Col>
      </Row>

      <Card title="AI 智能记账" style={{ marginTop: 24 }}>
        <TextArea
          rows={4}
          placeholder="输入你的消费记录，例如：午餐花了35元"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={loading}
            onClick={handleParse}
          >
            智能识别
          </Button>
        </div>

        {parsedResult && (
          <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <h3>识别结果：</h3>
            <p><strong>金额：</strong>¥{parsedResult.amount || '未识别'}</p>
            <p><strong>类型：</strong>{parsedResult.type === 'income' ? '收入' : '支出'}</p>
            <p><strong>分类：</strong>{parsedResult.categoryName}</p>
            <p><strong>备注：</strong>{parsedResult.note}</p>
            <p><strong>置信度：</strong>{(parsedResult.confidence * 100).toFixed(1)}%</p>
          </div>
        )}
      </Card>
    </div>
  )
}
