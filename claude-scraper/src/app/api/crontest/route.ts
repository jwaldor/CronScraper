import { NextResponse } from "next/server";
import { jobService } from "../services/job";
import { processJob } from "../services/scrapes";
import { sendEmailWithSendGrid } from "@/utils/mail";

export const config = {
  cron: "0 0 * * *",
};

export async function GET() {
  try {
    const currentTime = new Date().toISOString();
    console.log(`Cron job executed at: ${currentTime}`);
    const jobs = await jobService.getAllJobs();
    console.log(jobs, "jobs");

    const emails: string[] = [];
    for (const job of jobs) {
      console.log(job, "processing job");
      const content = await processJob(job);
      if (content) {
        emails.push(content);
      }
    }

    console.log(emails, "emails");
    if (emails.length > 0) {
      await sendEmailWithSendGrid("New events found", emails.join("\n"));
    }

    return NextResponse.json({
      status: "success",
      message: "Cron job executed successfully",
      timestamp: currentTime,
    });
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
