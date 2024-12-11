import { db } from "@/lib/db";
import { ScrapeJob } from "@prisma/client";
import { z } from "zod";

export interface JobService {
  getAllJobs(): Promise<ScrapeJob[]>;
  getJobByUrl(url: string): Promise<ScrapeJob | null>;
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
  async getJobByUrl(url: string): Promise<ScrapeJob | null> {
    try {
      const job = await db.scrapeJob.findFirst({ where: { url } });
      return job;
    } catch (error) {
      console.error("Error fetching job by url:", error);
      throw new Error("Failed to fetch job by url");
    }
  },
};

// Input validation schema
export const addJobSchema = z.object({
  url: z.string(),
  requestString: z.string(),
});

export type AddJobInput = z.infer<typeof addJobSchema>;

export async function addUpdateJob(data: AddJobInput) {
  console.log("data", data, data.url);
  // const testJob = await db.scrapeJob.findUnique({
  //   where: { id: 1 },
  // });
  // console.log("testJob", testJob);
  const existingJob = await db.scrapeJob.findUnique({
    where: { url: data.url },
  });
  console.log("existingJob", existingJob);

  if (existingJob) {
    console.log("updating job");
    return await db.scrapeJob.update({
      where: { url: data.url },
      data: {
        requestString: data.requestString,
        updatedAt: new Date(),
      },
    });
  }
  console.log("creating job");
  return await db.scrapeJob.create({
    data: {
      url: data.url,
      requestString: data.requestString,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function updateJob(data: AddJobInput) {
  const job = await db.scrapeJob.update({
    where: { url: data.url },
    data: {
      updatedAt: new Date(),
    },
  });

  return job;
}
