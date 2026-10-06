import { NextResponse } from 'next/server';
import { PACK_PRICE_KSH, ORDER_REFERENCE_PREFIX } from '@milkman/shared';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customerName: string;
      phone: string | null;
      packs: number;
      total: number;
      location: string;
      note?: string | null;
    };

    if (!body.customerName || !body.phone || !body.location || body.packs < 1) {
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const reference = `${ORDER_REFERENCE_PREFIX}${String(Math.floor(1000 + Math.random() * 9000))}`;

    return NextResponse.json({ reference }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 }
    );
  }
}