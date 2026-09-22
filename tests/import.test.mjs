// Run with: bun test tests/import.test.mjs
import { afterAll, beforeEach, expect, mock, test } from "bun:test";

class NextResponse extends Response {
  static json(data, init) {
    return new NextResponse(JSON.stringify(data), init);
  }
}
mock.module("next/server", () => ({ NextResponse, NextRequest: Request }));
let rows;
let nextId;
const prisma = {
  prompt: {
    findMany: async () => rows.filter((row) => !row.deleted).map((row) => ({ ...row })),
    create: async ({ data }) => {
      const row = { ...data, id: String(nextId++) };
      rows.push(row);
      return row;
    },
    update: async ({ where, data }) => {
      const row = rows.find((row) => row.id === where.id);
      if (!row) throw new Error("missing row");
      Object.assign(row, data);
      return row;
    },
  },
};
mock.module("../src/lib/prisma.ts", () => ({ prisma }));
const { POST } = await import("../src/app/api/import/route.ts");
afterAll(() => mock.restore());
beforeEach(() => { rows = []; nextId = 1; });

async function importPrompts(prompts, updateDuplicates = false) {
  const response = await POST(new Request("http://localhost/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { prompts }, updateDuplicates }),
  }));
  expect(response.status).toBe(200);
  return response.json();
}

test("skips duplicates introduced earlier in the same import", async () => {
  const result = await importPrompts([
    { title: "Example", content: "Prompt" },
    { title: " EXAMPLE ", content: " Prompt " },
  ]);
  expect(result).toEqual({ imported: 1, updated: 0, skipped: 1, errors: [] });
  expect(rows).toHaveLength(1);
});

test("updateDuplicates updates the row created earlier in the batch", async () => {
  const result = await importPrompts([
    { title: "Example", content: "Prompt", description: "old" },
    { title: "Example", content: "Prompt", description: "new", favorite: true },
  ], true);
  expect(result).toEqual({ imported: 1, updated: 1, skipped: 0, errors: [] });
  expect(rows).toHaveLength(1);
  expect(rows[0].description).toBe("new");
  expect(rows[0].favorite).toBe(true);
});

test("existing duplicates are skipped while different content remains distinct", async () => {
  rows.push({ id: "existing", title: "Example", content: "Prompt" });
  const result = await importPrompts([
    { title: "Example", content: "Prompt" },
    { title: "Example", content: "Different prompt" },
  ]);
  expect(result).toEqual({ imported: 1, updated: 0, skipped: 1, errors: [] });
  expect(rows).toHaveLength(2);
});

test("reimporting a batch does not create additional copies", async () => {
  const prompts = [{ title: "Example", content: "Prompt" }, { title: "Example", content: "Prompt" }];
  await importPrompts(prompts);
  const result = await importPrompts(prompts);
  expect(result).toEqual({ imported: 0, updated: 0, skipped: 2, errors: [] });
  expect(rows).toHaveLength(1);
});
