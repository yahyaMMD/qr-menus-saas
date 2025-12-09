import { NextResponse } from 'next/server'

// Placeholder handler to keep the route valid until full integration is added.
export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Chargily webhook handler not implemented.' },
    { status: 501 }
  )
}
