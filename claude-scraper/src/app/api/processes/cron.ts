import { extractPageText } from "@/utils/processWebpage";
import { processWebpage } from "@/utils/processWebpage";
import { jobService } from "../services/job";
import { sendEmailWithSendGrid } from "@/utils/mail";
import { ScrapeJob } from "@prisma/client";
import puppeteer from "puppeteer";

export async function processCronJobs() {
  const currentTime = new Date().toISOString();
  console.log(`Cron job executed at: ${currentTime}`);
  const jobs = await jobService.getAllJobs();
  console.log(jobs, "jobs");

  const emails: string[] = [];
  const browser = await puppeteer.launch({
    headless: true,
  });

  for (const job of jobs) {
    console.log(job, "processing job");
    console.log("starting to process job");
    const webpage = await extractPageText(job.url, browser);
    console.log("obtained webpage", webpage);
    if (!webpage || webpage === job.lastPageBody) {
      return;
    }

    console.log("webpage is not the same as last page body");
    const content = await processWebpage(webpage, job.requestString);
    console.log(content, "content");

    if (content) {
      emails.push(content);
    }
  }
  await browser.close();

  console.log(emails, "emails");
  if (emails.length > 0) {
    await sendEmailWithSendGrid("New events found", emails.join("\n"));
  }

  return {
    status: "success",
    message: "Cron job executed successfully",
    timestamp: currentTime,
  };
}

export async function processCronJobAddJob(job: ScrapeJob) {
  console.log("starting to process job");
  const browser = await puppeteer.launch({
    headless: true,
  });
  const webpage = await extractPageText(job.url, browser);
  console.log("obtained webpage", webpage);
  if (!webpage || webpage === job.lastPageBody) {
    return;
  }
  await browser.close();

  console.log("webpage is not the same as last page body");
  const content = await processWebpage(webpage, job.requestString);
  console.log(content, "content");

  if (content) {
    await sendEmailWithSendGrid("Events for your new job", content);
  }
  return content;
}
