'use client';

import { platformColorMap, platformLabelMap } from '@/lib/mock-data/customer';

interface ChannelBadgeProps {
  channel: string; // accepts both ChannelType values and legacy lowercase keys
}

export function ChannelBadge({ channel }: ChannelBadgeProps) {
  const color   = platformColorMap[channel]  ?? '#64748b';
  const display = platformLabelMap[channel]  ?? channel;
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {display}
    </span>
  );
}
