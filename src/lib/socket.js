const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

let io

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', { algorithms: ['HS256'] })
    return decoded
  } catch (error) {
    return null
  }
}

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    
    if (!token) {
      return next(new Error('Authentication error'))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return next(new Error('Authentication error'))
    }

    socket.userId = decoded.userId
    socket.userName = decoded.name
    next()
  })

  io.on('connection', (socket) => {
    socket.join(socket.userId)

    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId)
    })

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(conversationId)
    })

    socket.on('send-message', (data) => {
      const { conversationId, message } = data
      io.to(conversationId).emit('new-message', message)
    })

    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data
      
      socket.to(conversationId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping,
        conversationId
      })
    })

    socket.on('disconnect', () => {
    })
  })

  return io
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}

module.exports = { initSocket, getIO } 