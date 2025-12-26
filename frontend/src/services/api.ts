import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

interface StyleOptions {
  titleFontSize?: number;
  bodyFontSize?: number;
  titleFont?: string;
  bodyFont?: string;
}

interface GeneratePdfRequest {
  title: string;
  content: string;
  contentType: 'plain' | 'html';
  styles?: StyleOptions;
}

export const generatePdf = async (data: GeneratePdfRequest): Promise<Blob> => {
  const response = await axios.post(`${API_BASE_URL}/pdf/generate`, data, {
    responseType: 'blob',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const downloadPdf = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.data.status === 'ok';
  } catch {
    return false;
  }
};
