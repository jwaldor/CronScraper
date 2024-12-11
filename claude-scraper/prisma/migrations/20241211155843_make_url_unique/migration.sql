/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `scrape_jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "scrape_jobs_url_key" ON "scrape_jobs"("url");
