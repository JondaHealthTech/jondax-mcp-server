import { JondaXClient } from '../client.js';
import { GetResultsInput } from '../types.js';

export const getResultsToolDefinition = {
  name: 'get_extracted_results',
  description: 'Retrieve the extracted structured results (biomarkers, test values, reference ranges) for a completed document. Defaults to your account configured format (JSON, FHIR_JSON, HL7, CSV). Returns an HTTP 202 Accepted message if still in progress — if so, do not retry in a loop; tell the user to check again later, as processing may include manual human review.',
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

  // Parquet is binary: return it as a base64 MCP embedded resource so the
  // bytes survive intact. (client.getResults fetches it as arraybuffer.)
  // A 202 "still processing" response comes back as JSON even for parquet,
  // so only treat a completed 200 body as the binary blob.
  if (input.format === 'parquet' && result.status === 200) {
    const buffer = Buffer.isBuffer(result.data)
      ? result.data
      : Buffer.from(result.data);

    // The Parquet blob is opaque to the agent, so it has nothing to show the
    // client. Fetch the SAME data as CSV (identical columns — the backend's
    // Parquet output is built from the CSV rows) and return it as a readable
    // text block ALONGSIDE the binary blob. The agent can display the table
    // while the client still receives a valid .parquet file.
    let csvText: string | null = null;
    try {
      const csv = await client.getResults(input.uploadId, 'csv');
      if (csv.status === 200) {
        csvText = typeof csv.data === 'string' ? csv.data : JSON.stringify(csv.data, null, 2);
      }
    } catch {
      // Non-fatal: if the CSV companion fetch fails, still return the blob.
      csvText = null;
    }

    const content: any[] = [];
    if (csvText) {
      content.push({
        type: 'text',
        text:
          `Parquet file for upload ${input.uploadId} is attached as a binary resource ` +
          `(${buffer.length} bytes). The same data is shown below as CSV for readability:\n\n` +
          csvText,
      });
    }
    content.push({
      type: 'resource',
      resource: {
        uri: `jondax://results/${input.uploadId}.parquet`,
        mimeType: 'application/octet-stream',
        blob: buffer.toString('base64'),
      },
    });

    return { content };
  }

  // All other formats (and the 202 processing message) are text.
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
