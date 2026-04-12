"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

const ScreenNode = ({ data }: NodeProps) => {
  return (
    <div className="px-0 pb-0 rounded-lg bg-[#141414] border border-white/10 shadow-xl overflow-hidden min-w-[180px] group transition-all hover:border-[#18e299]/50">
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <span className="text-[11px] font-medium text-[#ededed] truncate max-w-[140px]">
          {data.label as string}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#18e299]" />
      </div>
      
      <div className="h-24 bg-[#0d0d0d] flex items-center justify-center relative overflow-hidden">
        {data.imageUrl ? (
          <img 
            src={data.imageUrl as string} 
            alt={data.label as string}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        
        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-2 !bg-[#18e299] !border-none"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !bg-[#18e299] !border-none"
        />
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2 !h-2 !bg-[#18e299] !border-none"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-[#18e299] !border-none"
        />
      </div>
      
      <div className="p-2 flex gap-1">
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#18e299]/20" />
        </div>
      </div>
    </div>
  );
};

export default memo(ScreenNode);
