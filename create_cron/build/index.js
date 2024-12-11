#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
const SERVER_ADDRESS_BASE = "http://localhost:3000/api";
// Define Zod schemas for validation
const ScrapeArgumentsSchema = z.object({
    url: z.string(),
    requestedInformation: z.string(),
});
// Define Zod schemas for validation
const GetScrapeArgumentsSchema = z.object({
    url: z.string(),
});
const UpdateScrapeArgumentsSchema = z.object({
    url: z.string(),
    requestedInformation: z.string(),
});
// Create server instance
const server = new Server({
    name: "scrape_page",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "add_scrape_page_job",
                description: "Scrape a page for information on a regular basis.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The URL of the page to scrape",
                        },
                        requestedInformation: {
                            type: "string",
                            description: "The information to scrape from the page. Make this as specific and descriptive as possible.",
                        },
                    },
                    required: ["url", "requestedInformation"],
                },
            },
            {
                name: "get_scrape_page_job_by_url",
                description: "Get a scraping job by its URL to view its current requestedInformation",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The URL of the page that is being scraped",
                        },
                    },
                },
            },
            {
                name: "update_scrape_page_job",
                description: "Update a scraping job by its URL to change its requestedInformation",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The URL of the page that is being scraped",
                        },
                        requestedInformation: {
                            type: "string",
                            description: "The new information to scrape from the page. Make this as specific and descriptive as possible and in accordance with the user's wishes.",
                        },
                    },
                },
            },
        ],
    };
});
//Helper functions
// Helper function for making NWS API requests
async function makeScrapeRequest(url, requestString) {
    try {
        const response = await fetch(`${SERVER_ADDRESS_BASE}/addJob`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url, requestString }),
        });
        console.error("response", response);
        console.error("response.body", response.body);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error("Error making request:", error);
        return null;
    }
}
async function makeGetScrapeRequest(url) {
    try {
        const response = await fetch(`${SERVER_ADDRESS_BASE}/getJobByUrl`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        });
        console.error("response", response);
        console.error("response.body", response.body);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error("Error making request:", error);
        return null;
    }
}
async function makeUpdateScrapeRequest(url, requestedInformation) {
    try {
        const response = await fetch(`${SERVER_ADDRESS_BASE}/updateJob`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url, requestedInformation }),
        });
        console.error("response", response);
        console.error("response.body", response.body);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error("Error making request:", error);
        return null;
    }
}
// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === "add_scrape_page_job") {
            const { url, requestedInformation } = ScrapeArgumentsSchema.parse(args);
            const scrapeData = await makeScrapeRequest(url, requestedInformation);
            if (!scrapeData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to add scraping job: ${JSON.stringify(args)}, url: ${url}, requestedInformation: ${requestedInformation}`,
                        },
                    ],
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfully added scraping job: ${JSON.stringify(scrapeData)}`,
                    },
                ],
            };
        }
        else if (name === "get_scrape_page_job_by_url") {
            const { url } = GetScrapeArgumentsSchema.parse(args);
            const scrapeData = await makeGetScrapeRequest(url);
            if (!scrapeData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to get scraping job: ${JSON.stringify(args)}`,
                        },
                    ],
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfully got scraping job: ${JSON.stringify(scrapeData)}`,
                    },
                ],
            };
        }
        else if (name === "update_scrape_page_job") {
            const { url, requestedInformation } = UpdateScrapeArgumentsSchema.parse(args);
            const scrapeData = await makeUpdateScrapeRequest(url, requestedInformation);
            if (!scrapeData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to update scraping job: ${JSON.stringify(args)}`,
                        },
                    ],
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfully updated scraping job: ${JSON.stringify(scrapeData)}`,
                    },
                ],
            };
        }
        else {
            throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid arguments: ${error.errors
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ")}`);
        }
        throw error;
    }
});
// async function main() {
//   // setup in claude desktop
//   updateConfig();
// }
// main();
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Create Cron MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
