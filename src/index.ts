#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as dotenv from "dotenv";
import {
	generateImage,
	GenerateImageArgs,
	generateImageToolDefinition,
	removeBackground,
	RemoveBackgroundArgs,
	removeBackgroundToolDefinition,
	outpaint,
	OutpaintArgs,
	outpaintToolDefinition,
	searchAndReplace,
	SearchAndReplaceArgs,
	searchAndReplaceToolDefinition,
	upscaleFast,
	UpscaleFastArgs,
	upscaleFastToolDefinition,
	upscaleCreative,
	UpscaleCreativeArgs,
	upscaleCreativeToolDefinition,
	controlSketch,
	ControlSketchArgs,
	controlSketchToolDefinition,
	findFileLocation,
	FindFileLocationArgs,
	findFileLocationToolDefinition,
} from "./tools/index.js";

dotenv.config();

if (!process.env.IMAGE_STORAGE_DIRECTORY) {
	if (process.platform === "win32") {
		// Windows
		process.env.IMAGE_STORAGE_DIRECTORY =
			"C:\\Windows\\Temp\\mcp-server-stability-ai";
	} else {
		// macOS or Linux
		process.env.IMAGE_STORAGE_DIRECTORY =
			"/tmp/tadasant-mcp-server-stability-ai";
	}
}

if (!process.env.STABILITY_AI_API_KEY) {
	throw new Error("STABILITY_AI_API_KEY is a required environment variable");
}

const server = new Server(
	{
		name: "stability-ai",
		version: "0.0.1",
	},
	{
		capabilities: {
			tools: {},
		},
	}
);

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	try {
		switch (name) {
			case generateImageToolDefinition.name:
				return generateImage(args as GenerateImageArgs);
			case removeBackgroundToolDefinition.name:
				return removeBackground(args as RemoveBackgroundArgs);
			case outpaintToolDefinition.name:
				return outpaint(args as OutpaintArgs);
			case searchAndReplaceToolDefinition.name:
				return searchAndReplace(args as SearchAndReplaceArgs);
			case upscaleFastToolDefinition.name:
				return upscaleFast(args as UpscaleFastArgs);
			case upscaleCreativeToolDefinition.name:
				return upscaleCreative(args as UpscaleCreativeArgs);
			case controlSketchToolDefinition.name:
				return controlSketch(args as ControlSketchArgs);
			case findFileLocationToolDefinition.name:
				return findFileLocation(args as FindFileLocationArgs);
			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(
				`Invalid arguments: ${error.errors
					.map((e) => `${e.path.join(".")}: ${e.message}`)
					.join(", ")}`
			);
		}
		throw error;
	}
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			generateImageToolDefinition,
			removeBackgroundToolDefinition,
			outpaintToolDefinition,
			searchAndReplaceToolDefinition,
			upscaleFastToolDefinition,
			upscaleCreativeToolDefinition,
			controlSketchToolDefinition,
			findFileLocationToolDefinition,
		],
	};
});

// Start the server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("stability-ai MCP Server running on stdio");
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
