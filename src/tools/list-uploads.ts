import { JondaXClient } from '../client.js';
import { ListUploadsInput } from '../types.js';

export const listUploadsToolDefinition = {
  name: 'list_uploads',
  description:
    'List your recent uploads (newest first) with their uploadId, file name, status, upload date and expiry date. ' +
    'Use this to discover uploadIds when you do not already have them. ' +
    'Optional filters: limit (default 10), a fromDate/toDate range, and status.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of uploads to return (1-100). Defaults to 10.',
      },
      fromDate: {
        type: 'string',
        description: 'Only include uploads on or after this date (ISO-8601, e.g. 2026-08-01). Inclusive.',
      },
      toDate: {
        type: 'string',
        description: 'Only include uploads on or before this date (ISO-8601, e.g. 2026-08-07). Inclusive.',
      },
      status: {
        type: 'string',
        enum: ['uploaded', 'processing', 'completed', 'failed'],
        description: 'Only include uploads with this status.',
      },
    },
    required: [],
  },
};

/** Format an ISO timestamp as "YYYY-MM-DD HH:mm" (UTC), or "-" when absent. */
function fmt(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  );
}

/** Pad/truncate a cell to a fixed width for a monospace table. */
function cell(value: string, width: number): string {
  const s = value ?? '';
  if (s.length > width) return s.slice(0, width - 1) + '…';
  return s.padEnd(width, ' ');
}

export async function handleListUploads(client: JondaXClient, input: ListUploadsInput) {
  const data = await client.listUploads({
    limit: input.limit,
    fromDate: input.fromDate,
    toDate: input.toDate,
    status: input.status,
  });

  const uploads: any[] = Array.isArray(data?.uploads) ? data.uploads : [];

  if (uploads.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: 'No uploads found for the given criteria.',
        },
      ],
    };
  }

  const header =
    cell('Uploaded', 16) + '  ' +
    cell('Expires', 16) + '  ' +
    cell('File', 30) + '  ' +
    cell('Status', 11) + '  ' +
    'uploadId';

  const rows = uploads.map((u) =>
    cell(fmt(u.uploadedDate), 16) + '  ' +
    cell(fmt(u.expiresAt), 16) + '  ' +
    cell(String(u.fileName ?? ''), 30) + '  ' +
    cell(String(u.status ?? ''), 11) + '  ' +
    String(u.uploadId ?? ''),
  );

  const count = data?.count ?? uploads.length;
  const text =
    `${count} upload(s), newest first:\n\n` +
    header + '\n' +
    rows.join('\n');

  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  };
}
