// app/dashboard/vitals/utils/api-vitals.ts
import { getAuthToken } from '@/lib/auth-client';

export type VitalType = 
  | 'heart-rate' 
  | 'blood-pressure' 
  | 'blood-sugar' 
  | 'weight' 
  | 'temperature';

export interface VitalEntry {
  id: string;
  type: VitalType;
  value: number | { systolic: number; diastolic: number };
  unit: string;
  note?: string;
  recordedAt: string;
}

export interface VitalStatsResponse {
  stats: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  recent: Array<{
    id: string;
    value: string;
    unit: string;
    recordedAt: string;
  }>;
}

export interface GetVitalStatsResponse {
  stats: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  recent: Array<{
    id: string;
    value: string;
    unit: string;
    recordedAt: string;
  }>;
}

// API Functions
export async function addVital(vitalData: any): Promise<VitalEntry> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/vitals/mv2001addvital', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(vitalData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to add vital');
  }

  return data.data.vital;
}

export async function getVitals(
  type?: VitalType,
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<VitalEntry[]> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(`/api/vitals/mv2002getvitals?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch vitals');
  }

  return data.data.vitals;
}

export async function getVitalStats(
  type: VitalType,
  days: number = 30
): Promise<GetVitalStatsResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/vitals/mv2003getvitalstats?type=${type}&days=${days}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch vital stats');
  }

  return data.data;
}

// Helper function to filter by date range
export function filterByRange(data: VitalEntry[], days: number): VitalEntry[] {
  const now = Date.now();
  return data.filter((v) => {
    const diff = (now - new Date(v.recordedAt).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= days;
  });
}

// Helper to calculate stats locally (for fallback)
export function calculateStats(data: VitalEntry[]): {
  avg: number;
  min: number;
  max: number;
  count: number;
} {
  if (data.length === 0) {
    return { avg: 0, min: 0, max: 0, count: 0 };
  }

  const numericValues = data.map(v => {
    if (typeof v.value === 'object' && 'systolic' in v.value) {
      return v.value.systolic;
    }
    return v.value as number;
  });

  const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  return {
    avg: parseFloat(avg.toFixed(1)),
    min,
    max,
    count: data.length
  };
}