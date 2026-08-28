import { JondaXClient } from '../client.js';
import { GetStatusInput } from '../types.js';

export const getStatusToolDefinition = {
  name: 'get_upload_status',
  description: 'Check the processing status of an uploaded document using its uploadId. Returns whether the document is uploaded, processing, completed, or failed, along with webhook callback delivery status.',
  inputSchema: {
    type: 'object',
    properties: {
      uploadId: {
        type: 'string',
        description: 'The UUID of the upload',
      },
    },
    required: ['uploadId'],
  },
};

export async function handleGetStatus(client: JondaXClient, input: GetStatusInput) {
  const result = await client.getStatus(input.uploadId);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
