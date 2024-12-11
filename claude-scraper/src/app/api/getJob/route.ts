import { NextResponse } from "next/server";
import { jobService } from "../services/job";

export async function GET(request: Request) {
  const job = await jobService.getJobByUrl(request.url);
  return NextResponse.json(job);
}
