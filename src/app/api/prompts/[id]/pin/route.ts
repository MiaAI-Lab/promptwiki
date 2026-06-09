import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.prompt.findFirst({
      where: {
        id,
        deleted: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        favorite: true,
      },
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Error pinning prompt:", error);
    return NextResponse.json(
      { error: "Failed to pin prompt" },
      { status: 500 }
    );
  }
}
