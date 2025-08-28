import { useEffect, useRef, useState } from 'react';
import { flushSync } from "react-dom";
import { Flex, Layout, App, Typography, Progress, Card } from 'antd';
import { cloneDeep } from 'lodash-es';
import Markdown from 'react-markdown'
const { Header, Footer, Sider, Content } = Layout;
import '@pages/panel/Panel.css';
import { Welcome, Sender, Bubble } from '@ant-design/x';
import markdownit from 'markdown-it';

const md = markdownit({ 
  html: true, 
  breaks: true,
  linkify: true,
  typographer: true
});
const renderMarkdown = (content: string) => {
  return (
    <Typography>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
  );
};
export default function Panel() {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const sessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { message } = App.useApp()

  // 自动滚动到底部的函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息更新时自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initCheckChat = async () => {
    if (!('LanguageModel' in self)) {
      message.error('当前浏览器不支持AI功能');
      return;
    }
  }
  
  const chat = async (value: string) => {
    if(!sessionRef.current) {
      try {
        const status = await (self as any).LanguageModel.availability()
        console.log(status);
        sessionRef.current = await (self as any).LanguageModel.create({
          monitor(m: any) {
            m.addEventListener('downloadprogress', (e: any) => {
              if (status != 'available') {
                const progress = Math.floor(e.loaded * 100);
                setIsDownloading(true);
                setDownloadProgress(progress);

                if(progress >= 100) {
                  setTimeout(() => {
                    setIsDownloading(false);
                    setDownloadProgress(null);
                  }, 1000);
                }
              }
            });
          },
        });  
      } catch (error) {
        message.error('初始化AI模型失败,请检查浏览器是否支持AI功能');
      }
    } 
    const newMessages = cloneDeep(messages)
    newMessages.push({ role: 'user', content: value })
    flushSync(() => {
      setMessages(newMessages)
    })
    const stream = sessionRef.current.promptStreaming(value)
    let content = ''
    const assistantMessage = { role: 'assistant', content: '' }
    newMessages.push(assistantMessage)
    flushSync(() => {
      setMessages([...newMessages])
    })
    for await (const chunk of stream) {
      content += chunk
      flushSync(() => {
        // console.log(content);
        setMessages((prev: any) => {
          const updatedMessages = [...prev]
          updatedMessages[updatedMessages.length - 1] = {
            ...updatedMessages[updatedMessages.length - 1],
            content: content
          }
          return updatedMessages
        })
      })
    }
 
    // setMessages(newMessages)
  }
  useEffect(() => {
    initCheckChat()
  }, []);
  return (
      <Layout style={{ height: '100vh', width: '100vw', backgroundColor: '#fff' }}>
        {isDownloading && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1001,
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <Card 
              size="small" 
              style={{ 
                maxWidth: '400px', 
                margin: '0 auto',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <Typography.Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                  🤖 AI模型下载中...
                </Typography.Text>
              </div>
              <Progress 
                percent={downloadProgress || 0} 
                status={downloadProgress === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                showInfo={false}
                style={{ marginBottom: '8px' }}
              />
              <div style={{ textAlign: 'center' }}>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  {downloadProgress}% 完成
                </Typography.Text>
              </div>
            </Card>
          </div>
        )}
        <Content style={{ padding: '20px', paddingTop: isDownloading ? '100px' : '20px' }}>
          <Flex 
            gap="middle" 
            style={{ 
              paddingBottom: '120px', 
              overflowY: 'auto', 
              paddingTop: '20px', 
              height: '100%',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
            }} 
            className="messages-container"
            vertical
          >
            {messages.map((message, index) => (
              <Bubble
               placement={message.role === 'user' ? 'end' : 'start'} 
               key={index} 
               style={{ maxWidth: message.role === 'user' ? '100%' : '80%' }}
               content={message.role === 'user' ? message.content : renderMarkdown(message.content)} 
               typing={{ step: 2, interval: 50 }}
               />
            ))}
            <div ref={messagesEndRef} />
          </Flex>
        </Content>
        <Footer style={{ backgroundColor: '#fff', width: '100%', padding: '20px', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Sender
            style={{ width: '100%' }}
            loading={loading}
            value={value}
            onChange={(v) => {
              setValue(v);
            }}
            onSubmit={async () => {
              setLoading(true);
              const val = value
              setValue('');
              await chat(val)
              setLoading(false);
            }}
            onCancel={() => {
              setLoading(false);
              message.error('Cancel sending!');
            }}
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Footer>
      </Layout>

  );
}
