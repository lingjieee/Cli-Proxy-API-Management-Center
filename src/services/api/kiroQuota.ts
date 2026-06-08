import type { KiroQuotaPayload } from '@/types';
import { apiClient } from './client';

export const kiroQuotaApi = {
  fetch: async (authIndex: string): Promise<KiroQuotaPayload> => {
    const encoded = encodeURIComponent(authIndex);
    return apiClient.get<KiroQuotaPayload>(`/kiro-quota?auth_index=${encoded}`);
  },
};
