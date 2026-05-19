'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageSkeleton } from '@/components/PageSkeleton';
import { topProducts } from '@/lib/mock-data';
import {
  type AdRow,
  type AdStopResult,
  type BudgetJudgeResult,
  type AdPlanForm,
  type AdPlanResult,
  type ImprovementResult,
  type ImproveCampaignRow,
} from '@/lib/mock-data/marketing';

// ── Components ───────────────────────────────────────────────────────────────
import { MarketingTopbar }         from '@/components/marketing/marketing-topbar';
import { MarketingProposalBanner } from '@/components/marketing/marketing-proposal-banner';
import { MarketingKpiStrip }       from '@/components/marketing/marketing-kpi-strip';
import { BudgetAllocationChart }   from '@/components/marketing/budget-allocation-chart';
import { ExecutionHistoryTable }   from '@/components/marketing/execution-history-table';
import { AdAssistantPanel }        from '@/components/marketing/ad-assistant-panel';
import { AdPlanningTab }           from '@/components/marketing/tabs/ad-planning-tab';
import { AdImprovementTab }        from '@/components/marketing/tabs/ad-improvement-tab';
import { BudgetJudgmentTab }       from '@/components/marketing/tabs/budget-judgment-tab';
import { StopJudgmentTab }         from '@/components/marketing/tabs/stop-judgment-tab';

// ── Tab key ──────────────────────────────────────────────────────────────────
type TabKey = 'planning' | 'improvement' | 'budget' | 'stop';

// ── Initial ad rows ──────────────────────────────────────────────────────────
const initialAdRows: AdRow[] = [
  { id: '1', adName: `${topProducts[0].name}_検索広告`,     monthlySpend: '18000', adRevenue: '68400', clicks: '2400', conversions: '168' },
  { id: '2', adName: `${topProducts[1].name}_ショッピング`, monthlySpend: '8000',  adRevenue: '9600',  clicks: '800',  conversions: '30'  },
  { id: '3', adName: `${topProducts[2].name}_ブランド`,     monthlySpend: '15000', adRevenue: '63000', clicks: '1200', conversions: '84'  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function MarketingAgentPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // ── Banner ──────────────────────────────────────────────────────────────────
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // ── Budget allocation ────────────────────────────────────────────────────────
  const [budgetExecuted, setBudgetExecuted] = useState(false);

  // ── Ad assistant tab ─────────────────────────────────────────────────────────
  const [adTab, setAdTab] = useState<TabKey>('planning');

  // ── Tab budget: Budget Judge ─────────────────────────────────────────────────
  const [t1Spend,       setT1Spend]       = useState('480000');
  const [t1Revenue,     setT1Revenue]     = useState('1824000');
  const [t1TargetRoas,  setT1TargetRoas]  = useState('3.0');
  const [t1Orders,      setT1Orders]      = useState('218');
  const [t1Margin,      setT1Margin]      = useState('40');
  const [t1StockDays,   setT1StockDays]   = useState('45');
  const [t1BudgetCap,   setT1BudgetCap]   = useState('700000');
  const [t1Competitor,  setT1Competitor]  = useState('normal');
  const [t1Loading,     setT1Loading]     = useState(false);
  const [t1Error,       setT1Error]       = useState(false);
  const [t1Result,      setT1Result]      = useState<BudgetJudgeResult | null>(null);
  const [t1BudgetCopied, setT1BudgetCopied] = useState(false);
  const [t1Toast,       setT1Toast]       = useState(false);

  const currentRoas = useMemo(() => {
    const spend = Number(t1Spend);
    const rev   = Number(t1Revenue);
    if (!spend || spend <= 0) return '—';
    return (rev / spend).toFixed(2);
  }, [t1Spend, t1Revenue]);

  // ── Tab stop: Ad Stop Judge ──────────────────────────────────────────────────
  const [adRows,    setAdRows]    = useState<AdRow[]>(initialAdRows);
  const [t2Loading, setT2Loading] = useState(false);
  const [t2Error,   setT2Error]   = useState(false);
  const [t2Result,  setT2Result]  = useState<AdStopResult | null>(null);

  // ── Planning tab ─────────────────────────────────────────────────────────────
  const [planForm, setPlanForm] = useState<AdPlanForm>({
    objective:      '売上を増やしたい',
    platforms:      [],
    budget:         '100000',
    productName:    topProducts[0]?.name ?? '',
    targetAudience: '',
    targetKpi:      'ROAS 3倍以上',
    campaignPeriod: '1ヶ月',
  });
  const [planResult,    setPlanResult]    = useState<AdPlanResult | null>(null);
  const [planLoading,   setPlanLoading]   = useState(false);
  const [metaChecks,    setMetaChecks]    = useState<Record<string, boolean>>({});
  const [googleChecks,  setGoogleChecks]  = useState<Record<string, boolean>>({});
  const [planCopied,    setPlanCopied]    = useState(false);

  // ── Improvement tab ──────────────────────────────────────────────────────────
  const initialImproveMeta: ImproveCampaignRow[] = [
    { id: 'im1', name: 'ヒノキボード_春の特集', spend: '120000', clicks: '2400', purchases: '42', roas: '', cvr: '', platform: 'meta'   },
    { id: 'im2', name: '有田焼_新商品告知',     spend: '80000',  clicks: '800',  purchases: '8',  roas: '', cvr: '', platform: 'meta'   },
  ];
  const [improveMetaRows,      setImproveMetaRows]      = useState<ImproveCampaignRow[]>(initialImproveMeta);
  const [improveGoogleRows,    setImproveGoogleRows]    = useState<ImproveCampaignRow[]>([]);
  const [improveTargetRoas,    setImproveTargetRoas]    = useState('3.0');
  const [improveTargetCpa,     setImproveTargetCpa]     = useState('3000');
  const [improveBudgetCap,     setImproveBudgetCap]     = useState('500000');
  const [improvementResult,    setImprovementResult]    = useState<ImprovementResult | null>(null);
  const [improvementLoading,   setImprovementLoading]   = useState(false);
  const [improveChecks,        setImproveChecks]        = useState<Record<string, boolean>>({});
  const [improveAdPlatformTab, setImproveAdPlatformTab] = useState('meta');

  if (!ready) return <PageSkeleton />;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleBudgetJudge = async () => {
    setT1Loading(true);
    setT1Result(null);
    setT1Error(false);
    try {
      const res = await fetch('/api/ad-budget-judge', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adSpend:            t1Spend,
          adRevenue:          t1Revenue,
          roas:               currentRoas,
          targetRoas:         t1TargetRoas,
          adOrders:           t1Orders,
          marginRate:         t1Margin,
          stockDays:          t1StockDays,
          budgetCap:          t1BudgetCap,
          competitorStrength: t1Competitor,
        }),
      });
      setT1Result(await res.json());
    } catch {
      setT1Result(null);
      setT1Error(true);
    } finally {
      setT1Loading(false);
    }
  };

  const handleT1BudgetCopy = () => {
    if (!t1Result) return;
    navigator.clipboard.writeText(`¥${t1Result.recommendedBudget.toLocaleString()}`);
    setT1BudgetCopied(true);
    setTimeout(() => setT1BudgetCopied(false), 2000);
  };

  const handleT1Delegate = () => {
    setT1Toast(true);
    setTimeout(() => setT1Toast(false), 3000);
  };

  const addAdRow = () => {
    if (adRows.length >= 10) return;
    setAdRows((prev) => [
      ...prev,
      { id: Date.now().toString(), adName: '', monthlySpend: '', adRevenue: '', clicks: '', conversions: '' },
    ]);
  };

  const removeAdRow = (id: string) => {
    setAdRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateAdRow = (id: string, field: keyof AdRow, value: string) => {
    setAdRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleAdStopJudge = async () => {
    setT2Loading(true);
    setT2Result(null);
    setT2Error(false);
    try {
      const res = await fetch('/api/ad-stop-judge', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ads: adRows }),
      });
      setT2Result(await res.json());
    } catch {
      setT2Result(null);
      setT2Error(true);
    } finally {
      setT2Loading(false);
    }
  };

  const handlePlanCreate = async () => {
    setPlanLoading(true);
    setPlanResult(null);
    try {
      const res = await fetch('/api/ad-planning', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective:      planForm.objective,
          platforms:      planForm.platforms,
          budget:         Number(planForm.budget),
          productName:    planForm.productName,
          targetAudience: planForm.targetAudience,
          targetKpi:      planForm.targetKpi,
        }),
      });
      setPlanResult(await res.json());
    } catch {
      setPlanResult(null);
    } finally {
      setPlanLoading(false);
    }
  };

  const handlePlanCopy = () => {
    if (!planResult) return;
    navigator.clipboard.writeText(JSON.stringify(planResult, null, 2));
    setPlanCopied(true);
    setTimeout(() => setPlanCopied(false), 2000);
  };

  const addImproveRow = (platform: 'meta' | 'google') => {
    const newRow: ImproveCampaignRow = {
      id: Date.now().toString(), name: '', spend: '', clicks: '',
      purchases: '', roas: '', cvr: '', platform,
    };
    if (platform === 'meta') setImproveMetaRows((prev) => [...prev, newRow]);
    else                      setImproveGoogleRows((prev) => [...prev, newRow]);
  };

  const removeImproveRow = (id: string, platform: 'meta' | 'google') => {
    if (platform === 'meta') setImproveMetaRows((prev) => prev.filter((r) => r.id !== id));
    else                      setImproveGoogleRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateImproveRow = (id: string, field: keyof ImproveCampaignRow, value: string, platform: 'meta' | 'google') => {
    if (platform === 'meta') setImproveMetaRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
    else                      setImproveGoogleRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleImprovementAnalyze = async () => {
    setImprovementLoading(true);
    setImprovementResult(null);
    const avgOrderValue = 5500;
    const campaigns = [
      ...improveMetaRows.map((r) => ({
        name:     r.name,
        spend:    Number(r.spend),
        clicks:   Number(r.clicks),
        purchases: Number(r.purchases),
        roas:     r.purchases && r.spend ? Number(r.purchases) * avgOrderValue / Number(r.spend) : 0,
        platform: 'meta',
      })),
      ...improveGoogleRows.map((r) => ({
        name:     r.name,
        spend:    Number(r.spend),
        clicks:   Number(r.clicks),
        cvr:      Number(r.cvr),
        roas:     Number(r.roas),
        platform: 'google',
      })),
    ].filter((c) => c.name);
    try {
      const res = await fetch('/api/ad-improvement', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaigns,
          targetRoas: Number(improveTargetRoas),
          targetCpa:  Number(improveTargetCpa),
        }),
      });
      setImprovementResult(await res.json());
    } catch {
      setImprovementResult(null);
    } finally {
      setImprovementLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ── 1. Topbar ──────────────────────────────────────── */}
      <MarketingTopbar />

      {/* ── 2. Proposal banner ─────────────────────────────── */}
      {!bannerDismissed && (
        <MarketingProposalBanner
          onApprove={() => setBannerDismissed(true)}
          onSkip={() => setBannerDismissed(true)}
        />
      )}

      {/* ── 3. KPI strip ───────────────────────────────────── */}
      <MarketingKpiStrip />

      {/* ── 4. Budget allocation chart ─────────────────────── */}
      <BudgetAllocationChart
        budgetExecuted={budgetExecuted}
        onExecuteBudget={() => setBudgetExecuted(true)}
      />

      {/* ── 5. Ad assistant ────────────────────────────────── */}
      <AdAssistantPanel activeTab={adTab} onTabChange={setAdTab}>
        {adTab === 'planning' && (
          <AdPlanningTab
            planForm={planForm}
            setPlanForm={setPlanForm}
            planResult={planResult}
            planLoading={planLoading}
            planCopied={planCopied}
            metaChecks={metaChecks}
            googleChecks={googleChecks}
            setMetaChecks={setMetaChecks}
            setGoogleChecks={setGoogleChecks}
            onCreatePlan={handlePlanCreate}
            onCopyPlan={handlePlanCopy}
          />
        )}
        {adTab === 'improvement' && (
          <AdImprovementTab
            improveAdPlatformTab={improveAdPlatformTab}
            setImproveAdPlatformTab={setImproveAdPlatformTab}
            improveMetaRows={improveMetaRows}
            improveGoogleRows={improveGoogleRows}
            improveTargetRoas={improveTargetRoas}
            setImproveTargetRoas={setImproveTargetRoas}
            improveTargetCpa={improveTargetCpa}
            setImproveTargetCpa={setImproveTargetCpa}
            improveBudgetCap={improveBudgetCap}
            setImproveBudgetCap={setImproveBudgetCap}
            improvementResult={improvementResult}
            improvementLoading={improvementLoading}
            improveChecks={improveChecks}
            setImproveChecks={setImproveChecks}
            onAddRow={addImproveRow}
            onRemoveRow={removeImproveRow}
            onUpdateRow={updateImproveRow}
            onCreateImprovement={handleImprovementAnalyze}
          />
        )}
        {adTab === 'budget' && (
          <BudgetJudgmentTab
            t1Spend={t1Spend}           setT1Spend={setT1Spend}
            t1Revenue={t1Revenue}       setT1Revenue={setT1Revenue}
            t1TargetRoas={t1TargetRoas} setT1TargetRoas={setT1TargetRoas}
            t1Orders={t1Orders}         setT1Orders={setT1Orders}
            t1Margin={t1Margin}         setT1Margin={setT1Margin}
            t1StockDays={t1StockDays}   setT1StockDays={setT1StockDays}
            t1BudgetCap={t1BudgetCap}   setT1BudgetCap={setT1BudgetCap}
            t1Competitor={t1Competitor} setT1Competitor={setT1Competitor}
            t1Loading={t1Loading}
            t1Error={t1Error}
            t1Result={t1Result}
            t1BudgetCopied={t1BudgetCopied}
            t1Toast={t1Toast}
            currentRoas={currentRoas}
            onJudgeBudget={handleBudgetJudge}
            onBudgetCopy={handleT1BudgetCopy}
            onDelegate={handleT1Delegate}
          />
        )}
        {adTab === 'stop' && (
          <StopJudgmentTab
            adRows={adRows}
            t2Loading={t2Loading}
            t2Error={t2Error}
            t2Result={t2Result}
            onAddAd={addAdRow}
            onRemoveAd={removeAdRow}
            onUpdateAd={updateAdRow}
            onJudgeStop={handleAdStopJudge}
          />
        )}
      </AdAssistantPanel>

      {/* ── 6. Execution history ───────────────────────────── */}
      <ExecutionHistoryTable />
    </div>
  );
}
