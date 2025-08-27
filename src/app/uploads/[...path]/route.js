import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { path: filePath } = resolvedParams
    
    const fullPath = path.join(process.cwd(), 'uploads', ...filePath)
    
    if (!fs.existsSync(fullPath)) {
      return new Response('File not found', { status: 404 })
    }

    const fileBuffer = fs.readFileSync(fullPath)
    const ext = path.extname(fullPath).toLowerCase()
    
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream'

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    return new Response('File not found', { status: 404 })
  }
} 