import { NextRequest, NextResponse } from 'next/server';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🧪 Admin test API called');
  
  try {
    return NextResponse.json({
      success: true,
      message: 'Admin API is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json(
      { success: false, message: 'Test API failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🧪 Admin test POST API called');
  
  try {
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Admin POST API is working',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Test POST API error:', error);
    return NextResponse.json(
      { success: false, message: 'Test POST API failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}