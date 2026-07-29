import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('discord-session')

  if (!sessionCookie) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    return NextResponse.json({ user: session }, { status: 200 })
  } catch {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('discord-session')
  return NextResponse.json({ success: true }, { status: 200 })
}
