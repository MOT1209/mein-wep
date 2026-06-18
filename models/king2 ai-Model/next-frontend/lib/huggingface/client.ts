export interface HFModel {
  id: string;
  pipeline: string;
  downloads: number;
  likes: number;
  tags: string[];
  description: string;
}

export interface HFDataset {
  id: string;
  downloads: number;
  likes: number;
  tags: string[];
  description: string;
}

export interface HFSpace {
  id: string;
  sdk: string;
  likes: number;
  description: string;
}

const HF_API = 'https://huggingface.co/api';

function getToken(): string | null {
  const token = process.env.HF_TOKEN;
  return token && token !== 'your_hf_token_here' ? token : null;
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function searchModels(query: string, limit = 10): Promise<HFModel[]> {
  try {
    const url = `${HF_API}/models?search=${encodeURIComponent(query)}&sort=downloads&direction=-1&limit=${limit}`;
    const res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((m: any) => ({
      id: m.modelId || m.id,
      pipeline: m.pipeline_tag || 'unknown',
      downloads: m.downloads || 0,
      likes: m.likes || 0,
      tags: m.tags || [],
      description: (m.description || '').slice(0, 300),
    }));
  } catch {
    return [];
  }
}

export async function searchDatasets(query: string, limit = 10): Promise<HFDataset[]> {
  try {
    const url = `${HF_API}/datasets?search=${encodeURIComponent(query)}&sort=downloads&direction=-1&limit=${limit}`;
    const res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      downloads: d.downloads || 0,
      likes: d.likes || 0,
      tags: d.tags || [],
      description: (d.description || '').slice(0, 300),
    }));
  } catch {
    return [];
  }
}

export async function searchSpaces(query: string, limit = 10): Promise<HFSpace[]> {
  try {
    const url = `${HF_API}/spaces?search=${encodeURIComponent(query)}&sort=likes&direction=-1&limit=${limit}`;
    const res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((s: any) => ({
      id: s.id,
      sdk: s.sdk || 'unknown',
      likes: s.likes || 0,
      description: (s.description || '').slice(0, 300),
    }));
  } catch {
    return [];
  }
}

export async function getModelDetails(modelId: string): Promise<HFModel | null> {
  try {
    const url = `${HF_API}/models/${modelId}`;
    const res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const m = await res.json();
    return {
      id: m.modelId || m.id,
      pipeline: m.pipeline_tag || 'unknown',
      downloads: m.downloads || 0,
      likes: m.likes || 0,
      tags: m.tags || [],
      description: (m.description || '').slice(0, 300),
    };
  } catch {
    return null;
  }
}

export async function listInferenceModels(): Promise<string[]> {
  try {
    const token = getToken();
    if (!token) return [];
    const url = 'https://api-inference.huggingface.co/v1/models';
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((m: any) => m.id);
  } catch {
    return [];
  }
}
