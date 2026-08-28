import { JondaXClient } from '../client.js';
import { UploadPathologyInput } from '../types.js';

export const uploadPathologyToolDefinition = {
  name: 'upload_pathology_scan',
  description: 'Upload a pathology/blood test image (JPG, PNG) or PDF document to JondaX for AI OCR and biomarker extraction. Returns an uploadId for tracking.',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Absolute or relative local file path to the lab report image/PDF',
      },
      isDemo: {
        type: 'boolean',
        description: 'Optional flag for demo processing treatment',
      },
    },
    required: ['filePath'],
  },
};

export async function handleUploadPathology(client: JondaXClient, input: UploadPathologyInput) {
  const result = await client.uploadPathology(input.filePath, input.isDemo);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
