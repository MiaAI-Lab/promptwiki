import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildPromptQuery } from "@/lib/queries";
import { parseBody } from "@/lib/body-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const favorite = searchParams.get("favorite");
  const sort = searchParams.get("sort") || "updatedAt";

  const { where, orderBy } = buildPromptQuery({
    deleted: false,
    favorite: favorite === "true" ? "true" : undefined,
    category: category || undefined,
    query: query || undefined,
    sort,
  });

  try {
    const prompts = await prisma.prompt.findMany({
      where,
      orderBy,
      take: 200,
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (body instanceof NextResponse) return body;
    const {
      title,
      description,
      content,
      category,
      model,
      favorite,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const data: Prisma.PromptUncheckedCreateInput = {
      title: title.trim(),
      content: content.trim(),
    };

    if (description !== undefined && description !== null) {
      data.description = description.trim() || null;
    }
    if (category !== undefined) {
      data.category = category.trim() || null;
    }
    if (model !== undefined) {
      data.model = model.trim() || null;
    }
    if (favorite !== undefined) {
      data.favorite = Boolean(favorite);
    }

    const prompt = await prisma.prompt.create({
      data,
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
}
