import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      domain: 'spark.audiencelab.io',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      sparkApiUrl: process.env.NEXT_PUBLIC_SPARK_API_URL || 'not configured'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 