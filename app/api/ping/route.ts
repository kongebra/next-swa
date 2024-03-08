import { getTracer } from "@/lib/trace";
import { context } from "@opentelemetry/api";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(req: Request) {
  return getTracer().trace("ping testing", async (span) => {
    span.setAttribute("foo", "bar");

    span.end();

    return NextResponse.json({
      message: "pong",
    });
  });
}
