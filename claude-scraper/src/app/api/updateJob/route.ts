import { NextResponse } from "next/server";
import { addUpdateJob } from "../services/job";

export async function POST(request: Request) {
  const body = await request.json();
  const job = await addUpdateJob(body);
  return NextResponse.json(job);
}
