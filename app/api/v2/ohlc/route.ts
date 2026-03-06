import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instruments = searchParams.get('instruments');
    const interval = searchParams.get('interval');
    const count = searchParams.get('count');
    const end = searchParams.get('end');
    const start = searchParams.get('start');

    const authHeader = request.headers.get('Authorization');

    const res = await axios.get('https://qh-api.corp.hertshtengroup.com/api/v2/ohlc/', {
      params: {
        instruments,
        interval,
        count,
        end,
        start
      },
      headers: {
        Authorization: authHeader
      }
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error('API Route OHLC Error:', error.response?.data || error.message);
    
    if (error.response) {
      return NextResponse.json(
        error.response.data,
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { detail: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
