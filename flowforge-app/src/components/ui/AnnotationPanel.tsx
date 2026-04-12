"use client";

import React from "react";
import Button from "@/components/ui/Button";

interface AnnotationDetail {
  id: string;
  type: string;
  label: string;
  interaction?: string;
  validation?: string;
  errorState?: string;
  successState?: string;
  devNotes?: string;
  aiGenerated: boolean;
  color?: string;
}

interface AnnotationPanelProps {
  annotation: AnnotationDetail | null;
  onEdit?: (id: string, data: Partial<AnnotationDetail>) => void;
  onRegenerate?: (id: string) => void;
  onDelete?: (id: string) => void;
  isReadOnly?: boolean;
}

export default function AnnotationPanel({
  annotation,
  onEdit,
  onRegenerate,
  onDelete,
  isReadOnly = false,
}: AnnotationPanelProps) {
  if (!annotation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-3">
        <p className="text-[#888888] text-[13px] font-light leading-relaxed">
          Select an annotation on the canvas to inspect, or press D to draw a new one.
        </p>
      </div>
    );
  }

  const color = annotation.color || "#3b82f6";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-white text-[10px] font-mono uppercase tracking-wider"
              style={{ backgroundColor: color }}
            >
              {annotation.type}
            </span>
            {annotation.aiGenerated && (
              <span className="px-2 py-1 rounded-full bg-white/5 text-[#888888] text-[10px] font-mono uppercase tracking-wider">
                AI Generated
              </span>
            )}
          </div>
          <h3 className="text-[#ededed] text-[15px] font-medium tracking-tight">
            {annotation.label}
          </h3>
        </div>

        {/* Fields */}
        {[
          { label: "Interaction", value: annotation.interaction, key: "interaction" },
          { label: "Validation", value: annotation.validation, key: "validation" },
          { label: "Error State", value: annotation.errorState, key: "errorState" },
          { label: "Success State", value: annotation.successState, key: "successState" },
        ].map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-[#888888] uppercase tracking-[0.54px] text-[9px] font-mono">
              {field.label}
            </label>
            {isReadOnly ? (
              <p className="text-[#ededed] text-[12px] font-light leading-relaxed">
                {field.value || <span className="text-[#555] italic">Not specified</span>}
              </p>
            ) : (
              <textarea
                className="w-full bg-[#111111] border border-white/10 rounded-[6px] px-3 py-2 text-[#ededed] text-[12px] font-light leading-relaxed focus:outline-none focus:border-[#18e299] transition-colors resize-none"
                rows={2}
                value={field.value || ""}
                onChange={(e) => onEdit?.(annotation.id, { [field.key]: e.target.value })}
                placeholder={`Define ${field.label.toLowerCase()}...`}
              />
            )}
          </div>
        ))}

        {/* Dev Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[#888888] uppercase tracking-[0.54px] text-[9px] font-mono">
            Dev Notes
          </label>
          {isReadOnly ? (
            <p className="text-[#ededed] text-[12px] font-light leading-relaxed">
              {annotation.devNotes || <span className="text-[#555] italic">No notes provided</span>}
            </p>
          ) : (
            <textarea
              className="w-full bg-[#111111] border border-white/10 rounded-[6px] px-3 py-2 text-[#ededed] text-[12px] font-light leading-relaxed focus:outline-none focus:border-[#18e299] transition-colors resize-none"
              rows={4}
              value={annotation.devNotes || ""}
              onChange={(e) => onEdit?.(annotation.id, { devNotes: e.target.value })}
              placeholder="Add implementation notes here..."
            />
          )}
        </div>

        {/* Actions (Hidden in Read-Only) */}
        {!isReadOnly && (
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="glass-dark"
              className="w-full justify-center gap-2 py-2 text-[12px]"
              onClick={() => onRegenerate?.(annotation.id)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M10 6A4 4 0 112 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M10 3v3h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Regenerate AI Specs
            </Button>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 text-red-400/80 hover:text-red-400 hover:bg-red-400/5 rounded-full transition-all text-[12px]"
              onClick={() => onDelete?.(annotation.id)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 3h8M4 3V2h4v1M5 5v4M7 5v4M3 3l.5 7h5l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Delete Annotation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
