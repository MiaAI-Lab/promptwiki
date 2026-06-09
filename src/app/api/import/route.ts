import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/body-limit";

function validateExportData(data: unknown): {
  valid: boolean;
  error?: string;
  prompts?: any[];
} {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid data: expected a JSON object" };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.prompts)) {
    return { valid: false, error: "Invalid data: missing or invalid 'prompts' array" };
  }

  for (let i = 0; i < obj.prompts.length; i++) {
    const p = obj.prompts[i];
    if (!p || typeof p !== "object") {
      return { valid: false, error: `Invalid prompt at index ${i}` };
    }
    if (typeof p.title !== "string" || !p.title.trim()) {
      return { valid: false, error: `Prompt at index ${i} missing 'title'` };
    }
    if (typeof p.content !== "string" || !p.content.trim()) {
      return { valid: false, error: `Prompt at index ${i} missing 'content'` };
    }
  }

  return {
    valid: true,
    prompts: obj.prompts,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (body instanceof NextResponse) return body;
    const { updateDuplicates } = body;
    const data = body.data || body;

    const validation = validateExportData(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { prompts: importPrompts = [] } = validation;

    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Track existing prompts for duplicate detection (title + content)
    const existingPrompts = new Map<string, string>();
    const existingRows = await prisma.prompt.findMany({
      where: { deleted: false },
      select: { id: true, title: true, content: true },
    });
    existingRows.forEach((p) => {
      const key = `${p.title.toLowerCase()}|||${p.content.trim()}`;
      existingPrompts.set(key, p.id);
    });

    // Import each prompt
    for (const promptData of importPrompts) {
      try {
        const dedupKey = `${promptData.title.trim().toLowerCase()}|||${promptData.content.trim()}`;
        const existingId = existingPrompts.get(dedupKey);

        if (existingId && !updateDuplicates) {
          results.skipped++;
          continue;
        }

        const promptDataObj: any = {
          title: promptData.title.trim(),
          content: promptData.content.trim(),
          description:
            promptData.description?.trim() || null,
          category: promptData.category?.trim() || null,
          model: promptData.model?.trim() || null,
          favorite: Boolean(promptData.favorite),
        };

        if (existingId && updateDuplicates) {
          await prisma.prompt.update({
            where: { id: existingId },
            data: promptDataObj,
          });
          results.updated++;
        } else {
          // Create new prompt
          await prisma.prompt.create({
            data: promptDataObj,
          });

          results.imported++;
        }
      } catch (err: any) {
        console.error(`Failed to import "${promptData.title}":`, err);
        results.errors.push(
          `Failed to import "${promptData.title}": an error occurred`
        );
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error importing prompts:", error);
    return NextResponse.json(
      { error: "Failed to import prompts" },
      { status: 500 }
    );
  }
}
