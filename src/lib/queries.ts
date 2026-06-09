import { Prisma } from "@prisma/client";

export interface PromptQueryOptions {
  deleted?: boolean;
  favorite?: boolean | "true";
  category?: string;
  query?: string;
  sort?: string;
}

export function buildPromptQuery(
  options: PromptQueryOptions
): {
  where: Prisma.PromptWhereInput;
  orderBy: Prisma.PromptOrderByWithRelationInput;
} {
  const {
    deleted = false,
    favorite,
    category,
    query,
    sort,
  } = options;

  const where: Prisma.PromptWhereInput = { deleted };

  // Handle favorite filter
  if (favorite === true || favorite === "true") {
    where.favorite = true;
  }

  // Handle category filter
  if (category) {
    where.category = category;
  }

  // Handle search query
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      { content: { contains: query } },
      { category: { contains: query } },
    ];
  }

  // Build orderBy
  const validSorts = ["updatedAt", "createdAt", "title", "category"];
  const orderBy: Prisma.PromptOrderByWithRelationInput = {};
  if (sort && validSorts.includes(sort)) {
    orderBy[sort as keyof Prisma.PromptOrderByWithRelationInput] =
      sort === "title" || sort === "category" ? "asc" : "desc";
  } else {
    orderBy.updatedAt = "desc";
  }

  return { where, orderBy };
}
