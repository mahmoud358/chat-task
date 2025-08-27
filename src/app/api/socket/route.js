import { NextResponse } from 'next/server'
import { createServer } from 'http'
import { initSocket } from '@/lib/socket'

const server = createServer()
const io = initSocket(server)

export async function GET(request) {
  // This route is used to initialize the Socket.io server
  // The actual WebSocket connection is handled by Socket.io
  return NextResponse.json({ message: 'Socket.io server is running' })
}

// Export the server for use in other parts of the application
export { server } 