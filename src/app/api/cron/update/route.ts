import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: string[] = [];

    // 1. Clear Redis cache
    try {
      const keys = await redis.keys("pokemon:*");
      if (keys.length > 0) {
        await redis.del(...keys);
        results.push(`Cleared ${keys.length} Redis cache keys`);
      } else {
        results.push("Redis cache already empty");
      }
    } catch {
      results.push("Redis clear skipped (not available)");
    }

    // 2. Revalidate Next.js pages
    revalidatePath("/pokedex", "layout");
    revalidatePath("/", "layout");
    results.push("Revalidated Next.js cache");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
