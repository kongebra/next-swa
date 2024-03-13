import { getTracer } from "@/lib/trace";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
	return getTracer().trace("ping testing", async (span) => {
		span.setAttribute("foo", "bar");

		span.end();

		return NextResponse.json({
			message: "pong",
		});
	});
}
