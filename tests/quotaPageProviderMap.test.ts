import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { QUOTA_TAB_ORDER } from '../src/features/quota/constants';

// QuotaPage builds its per-provider quota-map lookup as an object literal cast to
// Record<QuotaProviderType, ...>. The cast silences exhaustiveness, so a provider
// added to QUOTA_TAB_ORDER without a matching literal key renders `undefined` and
// crashes the quota page on the first file of that provider (reading `<file>.json`
// of undefined). This source contract pins literal keys to the tab order.
const source = readFileSync(
  new URL('../src/features/quota/QuotaPage.tsx', import.meta.url),
  'utf8'
);


describe('quota page provider map completeness', () => {
  test('quotaByType literal covers every provider in QUOTA_TAB_ORDER', () => {
    const literal = source
      .split('const quotaByType = useMemo')[1]
      .split('}) as unknown as')[0];
    for (const provider of QUOTA_TAB_ORDER) {
      expect(literal).toContain(`${provider}:`);
    }
  });
});
