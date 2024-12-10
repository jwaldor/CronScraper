import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";
import puppeteer from "puppeteer";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}
// Launch the browser
const browser = await puppeteer.launch({
  headless: true, // Use new headless mode
});

// Initialize the Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface WebpageResult {
  content: string;
  status: number;
  url: string;
}

export async function obtainWebpage(url: string): Promise<WebpageResult> {
  try {
    const response = await axios.get(url);

    return {
      content: response.data,
      status: response.status,
      url: url,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch webpage: ${error.message}`);
    }
    throw error;
  }
}

export async function processWebpage(
  pageContent: string,
  prompt: string
): Promise<string> {
  try {
    // Construct the system message and user prompt
    const systemMessage = `You are an AI assistant analyzing a webpage. 
Your task is to process the webpage content according to the user's prompt.
Respond directly and concisely.`;

    const userMessage = `Webpage content:
---
${pageContent}
---

Task: ${prompt}`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      system: systemMessage,
      max_tokens: 4096,
      messages: [{ role: "user", content: userMessage }],
    });
    if (!("text" in response.content[0])) {
      throw new Error("No response from Claude");
    }
    // Return the assistant's response
    return response.content[0].text;
  } catch (error) {
    console.error("Error processing webpage with Claude:", error);
    throw new Error("Failed to process webpage with Claude");
  }
}

export async function extractPageText(url: string): Promise<string | null> {
  try {
    // Create a new page
    const page = await browser.newPage();
    console.log(page, "page");

    // Navigate to the URL
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Extract text content from the page
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log(text, "text");

    // Close the browser
    await browser.close();

    return text;
  } catch (error) {
    console.error("Error extracting text:", error);
    return null;
  }
}
