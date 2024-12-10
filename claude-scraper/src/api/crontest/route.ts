import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  // This should match the schedule in vercel.json
  cron: "0 0 * * *", // Runs at midnight every day
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const currentTime = new Date().toISOString();
    console.log(`Cron job executed at: ${currentTime}`);

    // Add your cron job logic here
    // For example, you could:
    // - Send emails
    // - Clean up database
    // - Fetch and process data
    // - Generate reports

    return res.status(200).json({
      status: "success",
      message: "Cron job executed successfully",
      timestamp: currentTime,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return res.status(500).json({
      status: "error",
      message: "Cron job failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
