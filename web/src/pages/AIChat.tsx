import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Spin, Typography, Space } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { chatWithAI, ChatMessage } from '../services/aiService';

const { TextArea } = Input;
const { Text } = Typography;

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好！我是你的记账助手 🤖\n\n我可以帮你：\n• 解答记账问题\n• 分析收支情况\n• 提供理财建议\n\n有什么可以帮你的吗？',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await chatWithAI(userMessage.content, history);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回答。请稍后再试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '如何添加一笔支出？',
    '怎么查看月度统计？',
    '有什么省钱建议？',
  ];

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card 
        title={
          <Space>
            <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span>AI 智能助手</span>
          </Space>
        }
        style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item style={{ 
                justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                border: 'none',
                padding: '8px 0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  maxWidth: '80%'
                }}>
                  <Avatar 
                    icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{ 
                      backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a',
                      margin: item.role === 'user' ? '0 0 0 12px' : '0 12px 0 0'
                    }}
                  />
                  <div style={{
                    background: item.role === 'user' ? '#1890ff' : '#f5f5f5',
                    color: item.role === 'user' ? '#fff' : '#333',
                    padding: '12px 16px',
                    borderRadius: 12,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {item.content}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">快捷问题：</Text>
            <Space wrap style={{ marginTop: 8 }}>
              {quickQuestions.map((q, i) => (
                <Button 
                  key={i} 
                  size="small" 
                  onClick={() => setInputText(q)}
                >
                  {q}
                </Button>
              ))}
            </Space>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入你的问题..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <Button 
            type="primary" 
            icon={loading ? <Spin size="small" /> : <SendOutlined />}
            onClick={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            发送
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIChat;
