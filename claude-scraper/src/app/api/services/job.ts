import { db } from "@/lib/db";
import { ScrapeJob } from "@prisma/client";
import { z } from "zod";

export interface JobService {
  getAllJobs(): Promise<ScrapeJob[]>;
}

export const jobService: JobService = {
  async getAllJobs(): Promise<ScrapeJob[]> {
    try {
      const jobs = await db.scrapeJob.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return jobs;
    } catch (error) {
      console.error("Error fetching all jobs:", error);
      throw new Error("Failed to fetch jobs");
    }
  },
};

// Input validation schema
export const addJobSchema = z.object({
  url: z.string().url(),
  requestString: z.string(),
});

export type AddJobInput = z.infer<typeof addJobSchema>;

export async function addJob(data: AddJobInput) {
  const job = await db.scrapeJob.create({
    data: {
      url: data.url,
      requestString: data.requestString,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return job;
}
