import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/body-limit";

export async function GET() {
  try {
    const results = await prisma.prompt.findMany({
      where: { deleted: false },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    const categories = results
      .map((r) => r.category)
      .filter((c): c is string => c !== null);

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (body instanceof NextResponse) return body;
    const { action } = body;

    if (action === "rename") {
      const { oldName, newName } = body;
      if (!oldName || newName === undefined) {
        return NextResponse.json(
          { error: "oldName and newName are required" },
          { status: 400 }
        );
      }
      const trimmedNewName = newName.trim();
      if (trimmedNewName && trimmedNewName !== oldName) {
        const existing = await prisma.prompt.findFirst({
          where: { category: trimmedNewName, deleted: false },
          select: { id: true },
        });
        if (existing) {
          return NextResponse.json(
            { error: `Category "${trimmedNewName}" already exists` },
            { status: 409 }
          );
        }
      }
      await prisma.prompt.updateMany({
        where: { category: oldName, deleted: false },
        data: { category: trimmedNewName || null },
      });
      return NextResponse.json({ success: true });
    } else if (action === "delete") {
      const { name } = body;
      if (!name) {
        return NextResponse.json(
          { error: "name is required" },
          { status: 400 }
        );
      }
      await prisma.prompt.updateMany({
        where: { category: name, deleted: false },
        data: { category: null },
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Unknown action" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500 }
    );
  }
}
