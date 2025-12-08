import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message is too short'),
});

const SUPPORT_INBOX = process.env.SUPPORT_EMAIL || 'support@qresto.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    const result = await sendEmail({
      to: SUPPORT_INBOX,
      subject: `Contact form: ${name}`,
      html,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: 'Sent' }, { status: 200 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
