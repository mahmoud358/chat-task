import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's conversations with last message
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        messages: {
          _count: 'desc'
        }
      }
    })

    // Format conversations to show other user's info
    const formattedConversations = conversations.map(conversation => {
      const otherMember = conversation.members.find(member => member.userId !== userId)
      const lastMessage = conversation.messages[0]

      return {
        id: conversation.id,
        otherUser: otherMember?.user || null,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          text: lastMessage.text,
          imageUrl: lastMessage.imageUrl,
          senderName: lastMessage.sender.name,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt
        } : null,
        createdAt: conversation.createdAt
      }
    })

    return NextResponse.json(formattedConversations)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const userId = request.headers.get('x-user-id')
    const { otherUserId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'Other user ID is required' },
        { status: 400 }
      )
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        members: {
          every: {
            userId: {
              in: [userId, otherUserId]
            }
          }
        }
      },
      include: {
        members: true
      }
    })

    if (existingConversation && existingConversation.members.length === 2) {
      return NextResponse.json(existingConversation)
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        members: {
          create: [
            { userId: userId },
            { userId: otherUserId }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(conversation)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 