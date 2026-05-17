import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Vercel Cron認証チェック
  const authHeader = req.headers.get('authorization');
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://ec-agent-mock.vercel.app';

  try {
    const response = await fetch(baseUrl + '/api/weekly-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weekStartDate: new Date().toISOString().split('T')[0],
        currentData: {
          revenue: 1870000,
          prevRevenue: 1650000,
          orders: 340,
          prevOrders: 298,
          cvr: 2.8,
          prevCvr: 2.5,
          grossProfit: 748000,
          prevGrossProfit: 660000,
          adSpend: 480000,
          roas: 3.8,
          stockoutCount: 2,
          repeatRate: 23,
        },
      }),
    });

    const reportData = await response.json();

    // 本番ではDBに保存するが、今はログのみ
    console.log(
      'Weekly report generated:',
      JSON.stringify(reportData).slice(0, 200),
    );

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Weekly report cron failed:', err);
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
  }
}
