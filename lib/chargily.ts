import { ChargilyClient } from '@chargily/chargily-pay';

export const chargilyClient = new ChargilyClient({
  api_key: process.env.CHARGILY_API_KEY!,
  mode:'live',
});

export type PaymentMethod = 'edahabia' | 'cib';