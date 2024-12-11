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
                name: "scrape_page",
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
        if (name === "scrape_page") {
            const { url, requestedInformation } = ScrapeArgumentsSchema.parse(args);
            const scrapeData = await makeScrapeRequest(url, requestedInformation);
            if (!scrapeData) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Failed to retrieve add scraping job",
                        },
                    ],
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfully added scraping job: ${scrapeData}`,
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
    console.error("Weather MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
