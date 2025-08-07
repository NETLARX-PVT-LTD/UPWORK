import { NextResponse } from 'next/server';

export async function GET() {
  // Mock stats data
  const mockStats = {
    totalDocuments: 156,
    documentsThisMonth: 23,
    lastLogin: new Date().toISOString()
  };

  return NextResponse.json(mockStats);
}