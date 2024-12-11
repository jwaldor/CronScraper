import { NextResponse } from "next/server";
import { addJob, addJobSchema } from "../services/job";
import { z } from "zod";
import { processCronJobAddJob } from "../processes/cron";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validated = addJobSchema.parse(body);

    // Add job using service
    const job = await addJob(validated);
    processCronJobAddJob(job);

    return NextResponse.json(
      {
        status: "success",
        data: job,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add scrape job:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid input",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to add scrape job",
      },
      { status: 500 }
    );
  }
}
