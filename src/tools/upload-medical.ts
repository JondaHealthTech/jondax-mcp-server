import { JondaXClient } from '../client.js';
import { UploadMedicalInput } from '../types.js';

export const uploadMedicalToolDefinition = {
  name: 'upload_medical_device',
  description: 'Upload a medical device scan image (pulse oximeter, blood pressure monitor, glucose meter, thermometer) to extract digital readings instantly.',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Absolute or relative local file path to the medical device scan image',
      },
    },
    required: ['filePath'],
  },
};

export async function handleUploadMedical(client: JondaXClient, input: UploadMedicalInput) {
  const result = await client.uploadMedical(input.filePath);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
