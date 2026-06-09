import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prompt = await prisma.prompt.findUnique({
      where: { id, deleted: false },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const newPrompt = await prisma.prompt.create({
      data: {
        title: `${prompt.title} (Copy)`,
        description: prompt.description,
        content: prompt.content,
        category: prompt.category,
        model: prompt.model,
        favorite: false,
      },
    });

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error("Error duplicating prompt:", error);
    return NextResponse.json(
      { error: "Failed to duplicate prompt" },
      { status: 500 }
    );
  }
}
