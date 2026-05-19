'use client';

import { useState, useEffect } from 'react';
import { PageSkeleton } from '@/components/PageSkeleton';
import { todayProposals } from '@/lib/mock-data/build';
import { BuildTopbar } from '@/components/build/build-topbar';
import { TodayProposalBanner } from '@/components/build/today-proposal-banner';
import { BuildTabStrip, type BuildTabKey } from '@/components/build/build-tab-strip';
import { TodayProposalsTab } from '@/components/build/tabs/today-proposals-tab';
import { PageGeneratorTab } from '@/components/build/tabs/page-generator-tab';
import { PriceAnalysisTab } from '@/components/build/tabs/price-analysis-tab';

export default function BuildAgentPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<BuildTabKey>('today');
  const [dismissedBanner, setDismissedBanner] = useState(false);

  if (!ready) return <PageSkeleton />;

  const handleExecute = (id: string) => setDone((d) => ({ ...d, [id]: true }));
  const handleApprove = (id: string) => {
    setDone((d) => ({ ...d, [id]: true }));
    setDismissedBanner(true);
  };
  const handleDismiss = (_id: string) => setDismissedBanner(true);

  const topProposal = todayProposals[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Topbar */}
      <BuildTopbar />

      {/* Always-visible banner — top proposal */}
      {!dismissedBanner && topProposal && (
        <TodayProposalBanner
          proposal={topProposal}
          onApprove={handleApprove}
          onDismiss={handleDismiss}
        />
      )}

      {/* Tab navigation */}
      <BuildTabStrip activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content — conditional rendering for isolation */}
      {activeTab === 'today' && (
        <TodayProposalsTab done={done} onExecute={handleExecute} />
      )}
      {activeTab === 'generator' && (
        <PageGeneratorTab />
      )}
      {activeTab === 'price' && (
        <PriceAnalysisTab />
      )}
    </div>
  );
}
