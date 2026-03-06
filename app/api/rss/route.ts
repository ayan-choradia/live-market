import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const res = await axios.get('https://www.federalreserve.gov/feeds/press_all.xml');
    return new NextResponse(res.data, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch RSS' }, { status: 500 });
  }
}
