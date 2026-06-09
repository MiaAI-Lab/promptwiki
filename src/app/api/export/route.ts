import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { deleted: false },
      orderBy: { createdAt: "asc" },
    });

    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      prompts: prompts.map((prompt) => ({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        content: prompt.content,
        category: prompt.category,
        model: prompt.model,
        favorite: prompt.favorite,
        createdAt: prompt.createdAt.toISOString(),
        updatedAt: prompt.updatedAt.toISOString(),
      })),
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="promptwiki-export.json"',
      },
    });
  } catch (error) {
    console.error("Error exporting prompts:", error);
    return NextResponse.json(
      { error: "Failed to export prompts" },
      { status: 500 }
    );
  }
}
