#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { JondaXClient } from './client.js';
import {
  uploadPathologyToolDefinition,
  handleUploadPathology,
} from './tools/upload-pathology.js';
import {
  uploadMedicalToolDefinition,
  handleUploadMedical,
} from './tools/upload-medical.js';
import {
  getStatusToolDefinition,
  handleGetStatus,
} from './tools/get-status.js';
import {
  getResultsToolDefinition,
  handleGetResults,
} from './tools/get-results.js';
import {
  UploadPathologyInputSchema,
  UploadMedicalInputSchema,
  GetStatusInputSchema,
  GetResultsInputSchema,
} from './types.js';

// Load environment variables (.env if present)
dotenv.config();

const client = new JondaXClient();

const server = new Server(
  {
    name: 'jondax-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// 1. List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      uploadPathologyToolDefinition,
      uploadMedicalToolDefinition,
      getStatusToolDefinition,
      getResultsToolDefinition,
    ],
  };
});

// 2. Execute tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'upload_pathology_scan': {
        const input = UploadPathologyInputSchema.parse(args);
        return await handleUploadPathology(client, input);
      }

      case 'upload_medical_device': {
        const input = UploadMedicalInputSchema.parse(args);
        return await handleUploadMedical(client, input);
      }

      case 'get_upload_status': {
        const input = GetStatusInputSchema.parse(args);
        return await handleGetStatus(client, input);
      }

      case 'get_extracted_results': {
        const input = GetResultsInputSchema.parse(args);
        return await handleGetResults(client, input);
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'An error occurred during tool execution';

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `[Error: ${name}] ${errorMessage}`,
        },
      ],
    };
  }
});

// 3. Connect via Standard Input/Output
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[JondaX MCP Server] Running on stdio transport');
}

run().catch((err) => {
  console.error('[JondaX MCP Server] Fatal error:', err);
  process.exit(1);
});
