import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

export class JondaXClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly http: AxiosInstance;

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = (config?.baseUrl || process.env.JONDAX_BASE_URL || 'https://app.jondax.eu').replace(/\/$/, '');
    this.apiKey = config?.apiKey || process.env.JONDAX_API_KEY || '';

    if (!this.apiKey) {
      console.error('[Warning] JONDAX_API_KEY is not set. API calls will fail without authentication.');
    }

    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 60000,
    });
  }

  /**
   * Upload pathology/lab report scan (image or PDF)
   */
  async uploadPathology(filePath: string, isDemo?: boolean): Promise<any> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found at path: ${resolvedPath}`);
    }

    const form = new FormData();
    form.append('deviceImage', fs.createReadStream(resolvedPath));
    if (isDemo !== undefined) {
      form.append('isDemo', String(isDemo));
    }

    const response = await this.http.post('/api/master?module=pathology', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return response.data;
  }

  /**
   * Upload medical device scan (e.g. oximeter, blood pressure, glucose)
   */
  async uploadMedical(filePath: string): Promise<any> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found at path: ${resolvedPath}`);
    }

    const form = new FormData();
    form.append('deviceImage', fs.createReadStream(resolvedPath));

    const response = await this.http.post('/api/master?module=medical', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return response.data;
  }

  /**
   * Get processing status for an uploadId
   */
  async getStatus(uploadId: string): Promise<any> {
    const response = await this.http.get(`/api/v1/status/${encodeURIComponent(uploadId)}`);
    return response.data;
  }

  /**
   * Get extracted structured results for an uploadId
   */
  async getResults(uploadId: string, format?: string): Promise<any> {
    const params = format ? { format } : {};

    // Parquet is binary (application/octet-stream). Fetch it as raw bytes so
    // axios does not decode the body as UTF-8 — that decode corrupts the
    // Parquet bytes and produces an unreadable file. All other formats are
    // text and keep the default (string/JSON) handling.
    const isBinary = format === 'parquet';

    const response = await this.http.get(`/api/v1/results/${encodeURIComponent(uploadId)}`, {
      params,
      responseType: isBinary ? 'arraybuffer' : undefined,
      validateStatus: (status) => status === 200 || status === 202,
    });

    // A 202 (still processing) returns a JSON body even for parquet requests.
    // When we asked for arraybuffer, decode that small body back to an object
    // so the caller can read the "processing" message rather than a buffer.
    let data = response.data;
    if (isBinary && response.status === 202) {
      try {
        data = JSON.parse(Buffer.from(response.data).toString('utf-8'));
      } catch {
        data = Buffer.from(response.data).toString('utf-8');
      }
    }

    return {
      status: response.status,
      headers: response.headers,
      data,
    };
  }

  /**
   * List the caller's uploads (newest first) with optional filters.
   */
  async listUploads(params: {
    limit?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
  }): Promise<any> {
    // Drop undefined values so we only send the filters the caller set.
    const query: Record<string, string | number> = {};
    if (params.limit !== undefined) query.limit = params.limit;
    if (params.fromDate) query.fromDate = params.fromDate;
    if (params.toDate) query.toDate = params.toDate;
    if (params.status) query.status = params.status;

    const response = await this.http.get('/api/v1/uploads', { params: query });
    return response.data;
  }
}
