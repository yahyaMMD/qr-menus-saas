import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdmin } from '@/lib/auth/route-guard'
import { notifyAnnouncementAll } from '@/lib/notifications'

const schema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  link: z.string().url().optional(),
})

export const dynamic = 'force-dynamic'

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }

  const count = await notifyAnnouncementAll(parsed.data.title, parsed.data.message, parsed.data.link)
  return NextResponse.json({ sent: count }, { status: 200 })
})
