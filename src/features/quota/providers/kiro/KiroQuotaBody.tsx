/** Kiro quota body renderer for both the quota page and auth-file cards. */

import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { KiroQuotaState, KiroQuotaSummary } from '@/types';
import { formatQuotaResetTime } from '@/utils/quota';
import { QuotaMeter } from '../../components/QuotaMeter';
import type { QuotaBodyProps } from '../../types';

const percentFromFraction = (fraction: number | null): number | null =>
  fraction === null ? null : Math.max(0, Math.min(100, fraction * 100));

export function KiroQuotaBody({ quota, classes }: QuotaBodyProps<KiroQuotaState>) {
  const { t } = useTranslation();
  const summary = quota.summary;

  if (!summary) {
    return <div className={classes.quotaMessage}>{t('kiro_quota.empty_data')}</div>;
  }

  return (
    <Fragment>
      {summary.subscriptionTitle && (
        <div className={classes.codexPlan}>
          <span className={classes.codexPlanLabel}>{t('kiro_quota.subscription_label')}</span>
          <span className={classes.codexPlanValue}>{summary.subscriptionTitle}</span>
        </div>
      )}
      <UsageRow summary={summary} classes={classes} t={t} />
      {(summary.freeTrialUsageLimit ?? 0) > 0 && (
        <FreeTrialRow summary={summary} classes={classes} t={t} />
      )}
      {summary.overageEnabled && (
        <div className={classes.codexPlan}>
          <span className={classes.codexPlanLabel}>{t('kiro_quota.overage_label')}</span>
          <span className={classes.codexPlanValue}>
            {t('kiro_quota.overage_enabled', {
              status: summary.overageStatus ?? t('kiro_quota.overage_default_status'),
            })}
          </span>
        </div>
      )}
    </Fragment>
  );
}

function UsageRow({
  summary,
  classes,
  t,
}: {
  summary: KiroQuotaSummary;
  classes: QuotaBodyProps<KiroQuotaState>['classes'];
  t: TFunction;
}) {
  const percent = percentFromFraction(summary.remainingFraction);
  const percentLabel = percent === null ? '--' : `${Math.round(percent)}%`;
  const amountLabel =
    summary.currentUsage !== null && summary.usageLimit !== null
      ? `${summary.currentUsage} / ${summary.usageLimit}`
      : summary.remaining !== null
        ? t('kiro_quota.remaining_amount', { amount: summary.remaining })
        : null;
  const label = summary.usageLabel ?? t('kiro_quota.usage_label');
  const resetLabel = summary.nextReset
    ? t('kiro_quota.reset_at', { time: formatQuotaResetTime(summary.nextReset) })
    : null;

  return (
    <div className={classes.quotaRow}>
      <div className={classes.quotaRowHeader}>
        <span className={classes.quotaModel}>{label}</span>
        <div className={classes.quotaMeta}>
          <span className={classes.quotaPercent}>{percentLabel}</span>
          {amountLabel && <span className={classes.quotaAmount}>{amountLabel}</span>}
          {resetLabel && <span className={classes.quotaReset}>{resetLabel}</span>}
        </div>
      </div>
      <QuotaMeter percent={percent} classes={classes} />
    </div>
  );
}

function FreeTrialRow({
  summary,
  classes,
  t,
}: {
  summary: KiroQuotaSummary;
  classes: QuotaBodyProps<KiroQuotaState>['classes'];
  t: TFunction;
}) {
  const percent = percentFromFraction(summary.freeTrialRemainingFraction);
  const percentLabel = percent === null ? '--' : `${Math.round(percent)}%`;
  const amountLabel =
    summary.freeTrialCurrentUsage !== null && summary.freeTrialUsageLimit !== null
      ? `${summary.freeTrialCurrentUsage} / ${summary.freeTrialUsageLimit}`
      : null;
  const label = summary.freeTrialStatus
    ? t('kiro_quota.free_trial_status', { status: summary.freeTrialStatus })
    : t('kiro_quota.free_trial_label');

  return (
    <div className={classes.quotaRow}>
      <div className={classes.quotaRowHeader}>
        <span className={classes.quotaModel}>{label}</span>
        <div className={classes.quotaMeta}>
          <span className={classes.quotaPercent}>{percentLabel}</span>
          {amountLabel && <span className={classes.quotaAmount}>{amountLabel}</span>}
        </div>
      </div>
      <QuotaMeter percent={percent} classes={classes} />
    </div>
  );
}
