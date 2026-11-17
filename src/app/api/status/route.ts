import { NextResponse } from "next/server";
import { getTokensCached } from "@/lib/ingestion";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getTokensCached();
    return NextResponse.json({
      sources: result.sources,
      stats: result.stats,
      isLive: result.isLive,
      fetchedAt: result.fetchedAt,
      rejectedNoTelegram: result.rejectedNoTelegram,
    });
  } catch (err) {
    console.error("status API error", err);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
