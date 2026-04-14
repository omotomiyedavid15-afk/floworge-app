"use client";

import React, { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react";

export type ConditionType = "yes" | "no" | "error" | "info" | "default";

const CONDITION_CONFIG: Record<ConditionType, { color: string; bg: string; border: string; label: string }> = {
  yes:     { color: "#18e299", bg: "rgba(24,226,153,0.12)",  border: "rgba(24,226,153,0.35)",  label: "Yes" },
  no:      { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)", label: "No" },
  error:   { color: "#eab308", bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.35)",   label: "Error" },
  info:    { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.35)",  label: "Info" },
  default: { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.15)", label: "" },
};

export interface FlowEdgeData extends Record<string, unknown> {
  condition?: ConditionType;
  label?: string;
}

export default function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const { setEdges } = useReactFlow();

  const condition: ConditionType = (data as FlowEdgeData)?.condition ?? "default";
  const label: string = (data as FlowEdgeData)?.label ?? "";
  const cfg = CONDITION_CONFIG[condition];

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  function startEdit() {
    setEditLabel(label);
    setEditing(true);
  }

  function commitEdit() {
    const trimmed = editLabel.trim();
    setEdges((eds) =>
      eds.map((e) =>
        e.id === id
          ? { ...e, data: { ...(e.data ?? {}), label: trimmed } }
          : e
      )
    );
    setEditing(false);
  }

  function cycleCondition(e: React.MouseEvent) {
    e.stopPropagation();
    const order: ConditionType[] = ["default", "yes", "no", "error", "info"];
    const next = order[(order.indexOf(condition) + 1) % order.length];
    setEdges((eds) =>
      eds.map((ed) =>
        ed.id === id
          ? { ...ed, data: { ...(ed.data ?? {}), condition: next } }
          : ed
      )
    );
  }

  const strokeColor = selected ? (condition === "default" ? "rgba(255,255,255,0.5)" : cfg.color) : cfg.color;
  const strokeWidth = selected ? 2.5 : 1.5;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: condition === "no" || condition === "error" ? "6 3" : undefined,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            zIndex: 10,
          }}
        >
          {editing ? (
            <input
              autoFocus
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="nodrag nopan"
              style={{
                background: "#1a1a1a",
                border: `1px solid ${cfg.color}`,
                borderRadius: "6px",
                color: "#ededed",
                fontSize: "11px",
                fontFamily: "var(--font-inter, sans-serif)",
                fontWeight: 450,
                padding: "3px 8px",
                outline: "none",
                width: "100px",
                textAlign: "center",
              }}
            />
          ) : (
            /* Label badge — always show a small dot if no label, or full pill if label exists */
            <div
              className="nodrag nopan"
              onClick={startEdit}
              title="Click to add label · Right-click to change condition"
              onContextMenu={(e) => { e.preventDefault(); cycleCondition(e); }}
              style={{ cursor: "pointer" }}
            >
              {label ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.color,
                    fontSize: "10px",
                    fontFamily: "var(--font-inter, sans-serif)",
                    fontWeight: 500,
                    letterSpacing: "-0.05px",
                    whiteSpace: "nowrap",
                    boxShadow: `0 0 8px ${cfg.color}22`,
                  }}
                >
                  <ConditionDot condition={condition} />
                  {label}
                </span>
              ) : selected ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px dashed rgba(255,255,255,0.15)",
                    color: "#555",
                    fontSize: "10px",
                    fontFamily: "var(--font-inter, sans-serif)",
                    fontWeight: 400,
                    cursor: "pointer",
                  }}
                >
                  + label
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: cfg.color,
                    opacity: 0.6,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function ConditionDot({ condition }: { condition: ConditionType }) {
  if (condition === "default") return null;
  const icons: Record<string, string> = {
    yes: "✓", no: "✕", error: "⚠", info: "i",
  };
  return (
    <span style={{ fontSize: "9px", fontWeight: 700, lineHeight: 1 }}>
      {icons[condition] ?? ""}
    </span>
  );
}
