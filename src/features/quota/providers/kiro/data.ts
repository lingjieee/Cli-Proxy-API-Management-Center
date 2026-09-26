/** Kiro quota data: usage + free-trial + overage from the management API. */

import type { TFunction } from 'i18next';
import type { AuthFileItem, KiroQuotaPayload, KiroQuotaState, KiroQuotaSummary } from '@/types';
import { kiroQuotaApi } from '@/services/api';
import { normalizeAuthIndex, normalizeNumberValue, normalizeStringValue } from '@/utils/quota';
import { isDisabledAuthFile, isKiroFile } from '@/utils/quota';
import type { QuotaProviderData } from '../types';

export const buildKiroQuotaSummary = (payload: KiroQuotaPayload): KiroQuotaSummary | null => {
  const usage = payload.usage;
  const freeTrial = payload.free_trial;
  const overage = payload.overage;
  const subscription = payload.subscription;
  const user = payload.user;

  const currentUsage = normalizeNumberValue(usage?.current_usage);
  const usageLimit = normalizeNumberValue(usage?.usage_limit);
  const remaining = normalizeNumberValue(usage?.remaining);
  const remainingFractionRaw = normalizeNumberValue(usage?.remaining_fraction);
  const remainingFraction =
    remainingFractionRaw !== null
      ? Math.max(0, Math.min(1, remainingFractionRaw))
      : usageLimit && currentUsage !== null
        ? Math.max(0, Math.min(1, (usageLimit - currentUsage) / usageLimit))
        : null;

  const freeTrialCurrentUsage = normalizeNumberValue(freeTrial?.current_usage);
  const freeTrialUsageLimit = normalizeNumberValue(freeTrial?.usage_limit);
  const freeTrialRemaining = normalizeNumberValue(freeTrial?.remaining);
  const freeTrialRemainingFractionRaw = normalizeNumberValue(freeTrial?.remaining_fraction);
  const freeTrialRemainingFraction =
    freeTrialRemainingFractionRaw !== null
      ? Math.max(0, Math.min(1, freeTrialRemainingFractionRaw))
      : freeTrialUsageLimit && freeTrialCurrentUsage !== null
        ? Math.max(
            0,
            Math.min(1, (freeTrialUsageLimit - freeTrialCurrentUsage) / freeTrialUsageLimit)
          )
        : null;

  const hasPrimaryUsage =
    currentUsage !== null ||
    usageLimit !== null ||
    remaining !== null ||
    remainingFraction !== null ||
    normalizeStringValue(usage?.display_name) !== null;

  if (!hasPrimaryUsage) return null;

  return {
    subscriptionTitle: normalizeStringValue(subscription?.title),
    subscriptionType: normalizeStringValue(subscription?.type),
    usageLabel: normalizeStringValue(usage?.display_name),
    currentUsage,
    usageLimit,
    remaining,
    remainingFraction,
    nextReset: normalizeStringValue(payload.next_reset),
    freeTrialStatus: normalizeStringValue(freeTrial?.status),
    freeTrialCurrentUsage,
    freeTrialUsageLimit,
    freeTrialRemaining,
    freeTrialRemainingFraction,
    overageEnabled: overage?.enabled === true,
    overageStatus: normalizeStringValue(overage?.status),
    userEmail: normalizeStringValue(user?.email),
    userId: normalizeStringValue(user?.user_id),
  };
};

const fetchKiroQuota = async (file: AuthFileItem, t: TFunction): Promise<KiroQuotaSummary> => {
  const rawAuthIndex = file['auth_index'] ?? file.authIndex;
  const authIndex = normalizeAuthIndex(rawAuthIndex);
  if (!authIndex) {
    throw new Error(t('kiro_quota.missing_auth_index'));
  }

  const payload = await kiroQuotaApi.fetch(authIndex);
  const summary = buildKiroQuotaSummary(payload);
  if (!summary) {
    throw new Error(t('kiro_quota.empty_data'));
  }
  return summary;
};

export const KIRO_CONFIG: QuotaProviderData<KiroQuotaState, KiroQuotaSummary> = {
  type: 'kiro',
  i18nPrefix: 'kiro_quota',
  filterFn: (file) => isKiroFile(file) && !isDisabledAuthFile(file),
  fetchQuota: fetchKiroQuota,
  storeSelector: (state) => state.kiroQuota,
  storeSetter: 'setKiroQuota',
  buildLoadingState: () => ({ status: 'loading', summary: null }),
  buildSuccessState: (summary) => ({ status: 'success', summary }),
  buildErrorState: (message, status) => ({
    status: 'error',
    summary: null,
    error: message,
    errorStatus: status,
  }),
};
