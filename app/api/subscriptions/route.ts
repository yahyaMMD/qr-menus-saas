import { NextResponse } from 'next/server'

// Placeholder endpoint until subscription logic is implemented.
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Subscriptions endpoint not implemented.' },
    { status: 501 }
  )
}
