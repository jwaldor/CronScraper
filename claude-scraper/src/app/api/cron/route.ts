import { NextResponse } from "next/server";
import { processCronJobs } from "../processes/cron";

export const config = {
  cron: "0 0 * * *",
};

export async function GET() {
  try {
    const result = await processCronJobs();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Cron job failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
