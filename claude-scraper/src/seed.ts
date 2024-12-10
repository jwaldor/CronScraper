import { db } from "@/lib/db";

// Create initial job
const job = await db.scrapeJob.create({
  data: {
    url: "https://lu.ma/nyc-tech",
    requestString:
      "What are the events on this page? List them out and provide the URLS to them",
  },
});

console.log("Seeded database with initial job:", job);
