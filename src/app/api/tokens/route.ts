import { NextResponse } from "next/server";
import { getTokensCached } from "@/lib/ingestion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const result = await getTokensCached();
    return NextResponse.json({
      tokens: result.tokens,
      stats: result.stats,
      isLive: result.isLive,
      fetchedAt: result.fetchedAt,
      rejectedNoTelegram: result.rejectedNoTelegram,
    });
  } catch (err) {
    console.error("tokens API error", err);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
