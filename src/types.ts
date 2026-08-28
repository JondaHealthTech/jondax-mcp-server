import { z } from 'zod';

export const UploadPathologyInputSchema = z.object({
  filePath: z.string().describe('Absolute or relative path to the local pathology/blood test image or PDF file to upload'),
  isDemo: z.boolean().optional().describe('Optional flag for demo processing treatment'),
});

export type UploadPathologyInput = z.infer<typeof UploadPathologyInputSchema>;

export const UploadMedicalInputSchema = z.object({
  filePath: z.string().describe('Absolute or relative path to the local medical device scan image (e.g. oximeter, blood pressure monitor, glucose meter)'),
});

export type UploadMedicalInput = z.infer<typeof UploadMedicalInputSchema>;

export const GetStatusInputSchema = z.object({
  uploadId: z.string().uuid().describe('The UUID of the upload returned by upload_pathology_scan'),
});

export type GetStatusInput = z.infer<typeof GetStatusInputSchema>;

export const GetResultsInputSchema = z.object({
  uploadId: z.string().uuid().describe('The UUID of the processed document to retrieve extracted data for'),
  format: z.enum(['json', 'fhir_json', 'hl7', 'fhir_xml', 'csv', 'parquet']).optional().describe('Optional format override. Defaults to the account configured outputFormat.'),
});

export type GetResultsInput = z.infer<typeof GetResultsInputSchema>;
