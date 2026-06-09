import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/body-limit";

const VALID_FIELDS = ["title", "content", "description"] as const;
type Field = (typeof VALID_FIELDS)[number];

function replaceAll(text: string, find: string, replace: string, caseSensitive: boolean): string {
  if (!caseSensitive) {
    const lower = text.toLowerCase();
    const findLower = find.toLowerCase();
    let result = "";
    let i = 0;
    while (i < text.length) {
      const idx = lower.indexOf(findLower, i);
      if (idx === -1) {
        result += text.slice(i);
        break;
      }
      result += text.slice(i, idx) + replace;
      i = idx + find.length;
    }
    return result;
  }
  return text.split(find).join(replace);
}

function matchesInField(value: string | null, find: string, caseSensitive: boolean): boolean {
  if (!value) return false;
  return caseSensitive
    ? value.includes(find)
    : value.toLowerCase().includes(find.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (body instanceof NextResponse) return body;

    const { find, replace, fields, caseSensitive = false, category, promptIds, dryRun = true } = body;

    if (typeof find !== "string" || !find.trim()) {
      return NextResponse.json({ error: "find is required and must be a non-empty string" }, { status: 400 });
    }
    if (typeof replace !== "string") {
      return NextResponse.json({ error: "replace must be a string" }, { status: 400 });
    }
    if (!Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: "fields must be a non-empty array" }, { status: 400 });
    }
    const invalidFields = fields.filter((f: string) => !VALID_FIELDS.includes(f as Field));
    if (invalidFields.length > 0) {
      return NextResponse.json({ error: `Invalid fields: ${invalidFields.join(", ")}` }, { status: 400 });
    }

    const where: any = { deleted: false };
    if (typeof category === "string" && category.trim()) {
      where.category = category.trim();
    }
    if (Array.isArray(promptIds) && promptIds.length > 0) {
      where.id = { in: promptIds };
    }

    const prompts = await prisma.prompt.findMany({
      where,
      select: { id: true, title: true, description: true, content: true },
    });

    if (dryRun) {
      const matches = prompts
        .map((p) => {
          const matchedFields = (fields as Field[]).filter((f) =>
            matchesInField(p[f] ?? null, find, caseSensitive)
          );
          return matchedFields.length > 0 ? { id: p.id, title: p.title, fields: matchedFields } : null;
        })
        .filter(Boolean);

      return NextResponse.json({ matches });
    }

    // Apply phase
    const results = { updated: 0, errors: [] as string[] };

    for (const prompt of prompts) {
      const matchedFields = (fields as Field[]).filter((f) =>
        matchesInField(prompt[f] ?? null, find, caseSensitive)
      );
      if (matchedFields.length === 0) continue;

      try {
        const data: Record<string, string | null> = {};
        for (const f of matchedFields) {
          const val = prompt[f];
          data[f] = val ? replaceAll(val, find, replace, caseSensitive) : val ?? null;
        }
        await prisma.prompt.update({ where: { id: prompt.id }, data: data as any });
        results.updated++;
      } catch (err: any) {
        results.errors.push(`Failed to update "${prompt.title}": an error occurred`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in find-replace:", error);
    return NextResponse.json({ error: "Find & Replace failed" }, { status: 500 });
  }
}
