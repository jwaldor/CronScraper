import { ScrapeJob } from "@prisma/client";
import { obtainWebpage } from "@/utils/processWebpage";
import { processWebpage } from "@/utils/processWebpage";

export async function processJob(job: ScrapeJob) {
  console.log("starting to process job");
  const webpage = await obtainWebpage(job.url);
  console.log("obtained webpage", webpage);
  if (webpage.content === job.lastPageBody) {
    return;
  }

  console.log("webpage is not the same as last page body");
  const content = await processWebpage(webpage.content, job.requestString);
  console.log(content, "content");

  return content;
}
