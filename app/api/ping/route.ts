import { trace } from "@opentelemetry/api";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return trace
    .getTracer("test-tracer")
    .startActiveSpan("ping testing", async (span) => {
      span.setAttribute("foo", "bar");

      span.end();

      return NextResponse.json({
        message: "pong",
      });
    });
}
