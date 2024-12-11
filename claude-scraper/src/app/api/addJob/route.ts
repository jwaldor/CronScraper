import { NextResponse } from "next/server";
import { addUpdateJob, addJobSchema } from "../services/job";
import { z } from "zod";
import { processCronJobAddJob } from "../processes/cron";

export async function POST(request: Request) {
  try {
    console.error("request", request);
    const body = await request.json();
    console.error("body", body);

    // Validate input
    console.log("validating with", addJobSchema);
    const validated = addJobSchema.parse(body);
    console.log("validated", validated);

    // Add job using service
    const job = await addUpdateJob(validated);
    console.log("job", job);
    const scrapedContent = await processCronJobAddJob(job);
    console.log("scrapedContent", scrapedContent);

    return NextResponse.json(
      {
        status: "success",
        data: job,
        content: scrapedContent,
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
