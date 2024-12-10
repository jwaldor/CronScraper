-- CreateTable
CREATE TABLE "scrape_jobs" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "requestString" TEXT NOT NULL,
    "lastPageBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrape_jobs_pkey" PRIMARY KEY ("id")
);
