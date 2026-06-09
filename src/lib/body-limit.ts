import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_SIZE = 50 * 1024 * 1024; // 50 MB

export async function parseBody(request: NextRequest): Promise<any | NextResponse> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }
  return request.json();
}
