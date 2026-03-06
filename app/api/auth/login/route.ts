import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const res = await axios.post('https://qh-api.corp.hertshtengroup.com/api/token/', {
      username,
      password
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error('API Route Login Error:', error.response?.data || error.message);
    
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
