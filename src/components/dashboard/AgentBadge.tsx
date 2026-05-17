type AgentType = 'build' | 'marketing' | 'inventory' | 'analytics';

const agentConfig: Record<
  AgentType,
  { label: string; color: string; href: string }
> = {
  build: {
    label: '構築AI',
    color: 'bg-green-100 text-green-700',
    href: '/agents/build',
  },
  marketing: {
    label: '集客AI',
    color: 'bg-blue-100 text-blue-700',
    href: '/agents/marketing',
  },
  inventory: {
    label: '在庫AI',
    color: 'bg-purple-100 text-purple-700',
    href: '/agents/inventory',
  },
  analytics: {
    label: '分析AI',
    color: 'bg-orange-100 text-orange-700',
    href: '/agents/analytics',
  },
};

export function AgentBadge({
  agent,
  clickable = true,
}: {
  agent: AgentType;
  clickable?: boolean;
}) {
  const config = agentConfig[agent];
  if (clickable) {
    return (
      <a href={config.href}>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 ${config.color}`}
        >
          {config.label}
        </span>
      </a>
    );
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
