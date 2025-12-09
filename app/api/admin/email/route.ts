import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdmin } from '@/lib/auth/route-guard'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

const schema = z.object({
  target: z.enum(['all', 'single']),
  email: z.string().email().optional(),
  subject: z.string().min(3),
  message: z.string().min(5),
})

export const dynamic = 'force-dynamic'

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }

  const { target, email, subject, message } = parsed.data

  let recipients: string[] = []

  if (target === 'single') {
    if (!email) {
      return NextResponse.json({ error: 'Email is required for single target' }, { status: 400 })
    }
    recipients = [email]
  } else {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { email: true },
    })
    recipients = users.map((u) => u.email!).filter(Boolean)
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found' }, { status: 400 })
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111;">
      <h2 style="color:#f97316; margin-bottom:12px;">${subject}</h2>
      <div style="padding:12px 0; white-space:pre-line;">${message}</div>
      <p style="color:#6b7280; font-size:13px; margin-top:24px;">Sent from QR Menus admin</p>
    </div>
  `

  const results = await Promise.allSettled(
    recipients.map((to) => sendEmail({ to, subject, html }))
  )

  const sent = results.filter((r) => r.status === 'fulfilled' && (r.value as any)?.success).length
  const failed = recipients.length - sent

  return NextResponse.json({ sent, failed, total: recipients.length }, { status: 200 })
})
