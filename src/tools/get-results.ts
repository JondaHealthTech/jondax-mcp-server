import { JondaXClient } from '../client.js';
import { GetResultsInput } from '../types.js';

export const getResultsToolDefinition = {
  name: 'get_extracted_results',
  description: 'Retrieve the extracted structured results (biomarkers, test values, reference ranges) for a completed document. Defaults to your account configured format (JSON, FHIR_JSON, HL7, CSV). Returns HTTP 202 Accepted message if still in progress.',
  inputSchema: {
    type: 'object',
    properties: {
      uploadId: {
        type: 'string',
        description: 'The UUID of the processed document',
      },
      format: {
        type: 'string',
        enum: ['json', 'fhir_json', 'hl7', 'fhir_xml', 'csv', 'parquet'],
        description: 'Optional format override (defaults to user account settings)',
      },
    },
    required: ['uploadId'],
  },
};

export async function handleGetResults(client: JondaXClient, input: GetResultsInput) {
  const result = await client.getResults(input.uploadId, input.format);
  
  // Format response nicely for LLM agent
  const textOutput = typeof result.data === 'string'
    ? result.data
    : JSON.stringify(result.data, null, 2);

  return {
    content: [
      {
        type: 'text',
        text: textOutput,
      },
    ],
  };
}
