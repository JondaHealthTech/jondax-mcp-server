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
    const response = await this.http.get(`/api/v1/results/${encodeURIComponent(uploadId)}`, {
      params,
      validateStatus: (status) => status === 200 || status === 202,
    });

    return {
      status: response.status,
      headers: response.headers,
      data: response.data,
    };
  }
}
