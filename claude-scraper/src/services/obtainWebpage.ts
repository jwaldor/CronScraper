import axios from "axios";

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
