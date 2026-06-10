import { NextRequest, NextResponse } from "next/server";
import { calculateDamage } from "@/lib/battle-engine";
import type { BattleCalcInput } from "@/types/pokemon";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = await request.json() as BattleCalcInput;

    if (!input.attacker?.pokemon || !input.defender?.pokemon || !input.attacker?.move) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = calculateDamage(input);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Battle calc error:", error);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
