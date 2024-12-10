import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Input validation schema
const addJobSchema = z.object({
  url: z.string().url(),
  requestString: z.string(),
  lastPageBody: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validated = addJobSchema.parse(body);

    // Add job to database
    const job = await db.scrapeJob.create({
      data: {
        url: validated.url,
        requestString: validated.requestString,
        lastPageBody: validated.lastPageBody || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

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
