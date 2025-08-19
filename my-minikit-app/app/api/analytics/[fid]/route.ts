import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { fid: string } }
) {
  try {
    const { fid } = params;

    const analytics = {
      followers: 15420,
      following: 892,
      engagement: 23.4,
      bestTimes: ["Wednesday 18-20h", "Friday 14-16h", "Sunday 12-14h"],
      overlapData: [
        { name: 'Tech', value: 45, color: '#3B82F6' },
        { name: 'Crypto', value: 32, color: '#10B981' },
        { name: 'Music', value: 28, color: '#F59E0B' },
        { name: 'Art', value: 22, color: '#EF4444' },
        { name: 'Gaming', value: 18, color: '#8B5CF6' },
      ],
      heatmapData: [
        { day: 'Mon', hour: 0, value: 2 }, { day: 'Mon', hour: 1, value: 1 }, { day: 'Mon', hour: 2, value: 0 },
        { day: 'Mon', hour: 3, value: 0 }, { day: 'Mon', hour: 4, value: 0 }, { day: 'Mon', hour: 5, value: 1 },
        { day: 'Mon', hour: 6, value: 3 }, { day: 'Mon', hour: 7, value: 5 }, { day: 'Mon', hour: 8, value: 8 },
        { day: 'Mon', hour: 9, value: 12 }, { day: 'Mon', hour: 10, value: 15 }, { day: 'Mon', hour: 11, value: 18 },
        { day: 'Mon', hour: 12, value: 22 }, { day: 'Mon', hour: 13, value: 25 }, { day: 'Mon', hour: 14, value: 28 },
        { day: 'Mon', hour: 15, value: 30 }, { day: 'Mon', hour: 16, value: 32 }, { day: 'Mon', hour: 17, value: 35 },
        { day: 'Mon', hour: 18, value: 40 }, { day: 'Mon', hour: 19, value: 38 }, { day: 'Mon', hour: 20, value: 35 },
        { day: 'Mon', hour: 21, value: 30 }, { day: 'Mon', hour: 22, value: 25 }, { day: 'Mon', hour: 23, value: 15 },
      ],
    };

    return Response.json({ fid: parseInt(fid, 10), analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
