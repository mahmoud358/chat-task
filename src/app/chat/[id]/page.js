'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'
import Link from 'next/link'

export default function ChatPage({ params }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const router = useRouter()
  const resolvedParams = use(params)
  const { id: conversationId } = resolvedParams

  useEffect(() => {
    fetchMessages()
    const timer = setTimeout(async () => {
      await initializeSocket()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data)
      
      const tokenResponse = await fetch('/api/auth/token')
      if (tokenResponse.ok) {
        const { token } = await tokenResponse.json()
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentUserId = payload.userId
        setCurrentUserId(currentUserId)
        
        if (data.length > 0) {
          const otherUserMessage = data.find(msg => msg.senderId !== currentUserId)
          if (otherUserMessage) {
            setOtherUser(otherUserMessage.sender)
          }
        }
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const initializeSocket = async () => {
    try {
      const tokenResponse = await fetch('/api/auth/token')
      
      if (!tokenResponse.ok) {
        return
      }

      const { token } = await tokenResponse.json()

      if (!token) {
        return
      }
      
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })

      newSocket.on('connect', () => {
        setSocketConnected(true)
        newSocket.emit('join-conversation', conversationId)
      })

      newSocket.on('new-message', (message) => {
        setMessages(prev => {
          const messageExists = prev.some(m => m.id === message.id)
          if (messageExists) {
            return prev
          }
          return [...prev, message]
        })
      })

      newSocket.on('user-typing', (data) => {
      })

      newSocket.on('disconnect', () => {
        setSocketConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        setSocketConnected(false)
      })

      newSocket.on('error', (error) => {
        setSocketConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    } catch (error) {
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (text, imageUrl = null) => {
    if (!text && !imageUrl) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, imageUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const message = await response.json()
      
      setMessages(prev => [...prev, message])
      
      if (socket) {
        socket.emit('send-message', {
          conversationId,
          message
        })
      }

      setNewMessage('')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      sendMessage(newMessage.trim())
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const data = await response.json()
      sendMessage('', data.imageUrl)
    } catch (error) {
      setError(error.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/inbox" className="mr-4">
              <button className="btn-secondary">
                ← Back
              </button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              {otherUser?.name || 'Chat'}
            </h1>
            <div className={`ml-2 w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                 title={socketConnected ? 'Connected' : 'Disconnected'} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)] flex flex-col">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-t-lg">
              {error}
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                const isReceived = message.senderId !== currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isReceived ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`message-bubble ${isReceived ? 'message-received' : 'message-sent'}`}>
                      {message.text && (
                        <p className="text-sm">{message.text}</p>
                      )}
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Shared image"
                          className="mt-2 rounded-lg max-w-xs"
                        />
                      )}
                      <p className={`text-xs mt-1 ${isReceived ? 'text-gray-500' : 'text-blue-100'}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1"
                disabled={uploading}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary"
              >
                📷
              </button>
              <button
                type="submit"
                disabled={!newMessage.trim() || uploading}
                className="btn-primary"
              >
                {uploading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 