import Anthropic from "@anthropic-ai/sdk";
import type { AITeamSuggestion, PokemonListItem } from "@/types/pokemon";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateTeamSuggestion(
  corePokemon: PokemonListItem,
  format: string,
  language: "th" | "en" = "th"
): Promise<AITeamSuggestion> {
  const prompt =
    language === "th"
      ? `คุณเป็นผู้เชี่ยวชาญ Pokémon Competitive ระดับโลก

ผู้ใช้ต้องการสร้างทีม Pokémon สำหรับรูปแบบ ${format} โดยมี ${corePokemon.nameEn} (${corePokemon.nameTh ?? corePokemon.nameEn}) เป็นตัวหลัก

ข้อมูล ${corePokemon.nameEn}:
- ประเภท: ${corePokemon.types.join(", ")}
- BST: ${corePokemon.stats.total}
- Stats: HP ${corePokemon.stats.hp} / ATK ${corePokemon.stats.attack} / DEF ${corePokemon.stats.defense} / SpA ${corePokemon.stats.specialAttack} / SpD ${corePokemon.stats.specialDefense} / SPE ${corePokemon.stats.speed}

แนะนำ Pokémon อีก 5 ตัวที่เข้ากันได้ดี พร้อม:
1. ท่าแนะนำ (4 ท่า)
2. ความสามารถแนะนำ
3. ไอเทมแนะนำ
4. เหตุผลที่เลือก (เป็นภาษาไทย)

กลับมาในรูปแบบ JSON ตามนี้:
{
  "pokemon": [
    {
      "id": <pokemon_id>,
      "nameEn": "<english_name>",
      "nameTh": "<thai_name>",
      "role": "<role in English>",
      "roleTh": "<บทบาทภาษาไทย>",
      "suggestedMoves": ["move1", "move2", "move3", "move4"],
      "suggestedAbility": "<ability_name>",
      "suggestedItem": "<item_name>",
      "reasoning": "<reasoning in English>",
      "reasoningTh": "<เหตุผลภาษาไทย>"
    }
  ],
  "teamStrategy": "<overall team strategy in English>",
  "teamStrategyTh": "<กลยุทธ์ทีมภาษาไทย>",
  "threats": ["threat1", "threat2", "threat3"],
  "coverageAnalysis": "<type coverage analysis>"
}`
      : `You are a world-class competitive Pokémon expert.

Build a team for ${format} format centered around ${corePokemon.nameEn}.

${corePokemon.nameEn} info:
- Types: ${corePokemon.types.join(", ")}
- BST: ${corePokemon.stats.total}
- Stats: HP ${corePokemon.stats.hp} / ATK ${corePokemon.stats.attack} / DEF ${corePokemon.stats.defense} / SpA ${corePokemon.stats.specialAttack} / SpD ${corePokemon.stats.specialDefense} / SPE ${corePokemon.stats.speed}

Suggest 5 teammates with moves, ability, item, and reasoning. Return JSON with same structure.`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Failed to parse AI team suggestion");
  }

  return JSON.parse(jsonMatch[0]) as AITeamSuggestion;
}

export async function aiSearch(
  query: string,
  language: "th" | "en" = "th"
): Promise<{
  intent: string;
  filters: Record<string, unknown>;
  description: string;
  descriptionTh: string;
}> {
  const prompt = `You are a Pokémon search assistant. Parse this search query and extract filters.

Query: "${query}"

Extract filters like:
- types (fire, water, etc.)
- minSpeed, maxSpeed, minAttack, etc.
- legendary (boolean)
- generation (1-9)
- abilities
- moves

Return JSON:
{
  "intent": "<what the user wants>",
  "filters": {
    "types": [],
    "generation": null,
    "minStat": {},
    "maxStat": {},
    "legendary": null,
    "abilities": [],
    "moves": []
  },
  "description": "<English description of search>",
  "descriptionTh": "<Thai description of search>"
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0]?.type === "text" ? message.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return {
      intent: query,
      filters: {},
      description: `Search for: ${query}`,
      descriptionTh: `ค้นหา: ${query}`,
    };
  }

  return JSON.parse(jsonMatch[0]);
}

export async function aiChat(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  const systemPrompt = `คุณเป็นผู้เชี่ยวชาญ Pokémon ที่รู้จักทุกอย่างเกี่ยวกับ Pokémon ทุก Generation

คุณสามารถตอบคำถามเกี่ยวกับ:
- ข้อมูล Pokémon, Moves, Abilities, Items
- กลยุทธ์การต่อสู้แบบ Competitive
- การสร้างทีม
- Counter Pokémon ต่างๆ
- Tier List และ Meta

ตอบเป็นภาษาไทยเป็นหลัก แต่ใช้ชื่อภาษาอังกฤษสำหรับ Pokémon, Moves, Items
ตอบให้ชัดเจน กระชับ และมีประโยชน์`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      ...history,
      { role: "user", content: message },
    ],
  });

  return response.content[0]?.type === "text" ? response.content[0].text : "";
}

export async function generateTrainerCardDescription(
  favoriteType: string,
  favoritePokemon: string,
  region: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `สร้างคำอธิบาย Trainer Card สำหรับ Trainer ที่:
- Pokémon โปรด: ${favoritePokemon}
- ประเภทโปรด: ${favoriteType}
- ภูมิภาค: ${region}

เขียนเป็นภาษาไทย 2-3 ประโยค สนุกและน่าสนใจ`,
      },
    ],
  });

  return message.content[0]?.type === "text" ? message.content[0].text : "";
}
