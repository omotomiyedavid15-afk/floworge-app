"use client";

import React, { memo, useState } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import type { FlowComment } from "./FlowEditor";

export interface ScreenNodeData extends Record<string, unknown> {
  label: string;
  imageUrl?: string | null;
  screenId?: string | null;
  comments?: FlowComment[];
  nodeType?: "screen" | "start" | "end";
}

// ── Handle styles ──────────────────────────────────────────────────────────────

const handleStyle = {
  width: 10,
  height: 10,
  background: "#18e299",
  border: "2px solid #0d0d0d",
  borderRadius: "50%",
  cursor: "crosshair",
} as React.CSSProperties;

// ── Node ───────────────────────────────────────────────────────────────────────

function ScreenNodeInner({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();
  const nodeData = data as ScreenNodeData;
  const commentCount = nodeData.comments?.length ?? 0;
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(nodeData.label);

  function commitLabel() {
    setEditingLabel(false);
    if (labelDraft.trim()) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label: labelDraft.trim() } } : n
        )
      );
    } else {
      setLabelDraft(nodeData.label);
    }
  }

  const isStart = nodeData.nodeType === "start";
  const isEnd   = nodeData.nodeType === "end";
  const isSpecial = isStart || isEnd;

  if (isSpecial) {
    return (
      <div
        style={{
          padding: "10px 22px",
          borderRadius: "999px",
          background: isStart ? "rgba(24,226,153,0.12)" : "rgba(248,113,113,0.10)",
          border: `1.5px solid ${isStart ? "rgba(24,226,153,0.4)" : "rgba(248,113,113,0.35)"}`,
          color: isStart ? "#18e299" : "#f87171",
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "-0.1px",
          whiteSpace: "nowrap",
          boxShadow: selected
            ? `0 0 0 2px ${isStart ? "#18e299" : "#f87171"}, 0 8px 32px rgba(0,0,0,0.4)`
            : "0 4px 16px rgba(0,0,0,0.35)",
          transition: "box-shadow 0.15s",
        }}
      >
        {isStart ? "▶ Start" : "■ End"}
        {isStart ? (
          <Handle type="source" position={Position.Right} style={handleStyle} />
        ) : (
          <Handle type="target" position={Position.Left} style={handleStyle} />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: 200,
        borderRadius: "14px",
        background: "#161616",
        border: selected
          ? "1.5px solid rgba(24,226,153,0.5)"
          : "1.5px solid rgba(255,255,255,0.09)",
        boxShadow: selected
          ? "0 0 0 3px rgba(24,226,153,0.12), 0 12px 40px rgba(0,0,0,0.5)"
          : "0 6px 24px rgba(0,0,0,0.4)",
        overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {/* ── Device chrome top bar ── */}
      <div
        style={{
          background: "#0d0d0d",
          padding: "7px 10px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: "5px" }}>
          {["#ef4444", "#eab308", "#22c55e"].map((c, i) => (
            <div
              key={i}
              style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: 0.7 }}
            />
          ))}
        </div>
        {/* Screen type badge */}
        <span
          style={{
            fontSize: "9px",
            fontWeight: 500,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: "#444",
            fontFamily: "var(--font-jetbrains-mono, monospace)",
          }}
        >
          SCREEN
        </span>
        {/* Status dot */}
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#18e299", opacity: 0.8 }} />
      </div>

      {/* ── Screen preview ── */}
      <div
        style={{
          height: 130,
          background: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {nodeData.imageUrl ? (
          <img
            src={nodeData.imageUrl}
            alt={nodeData.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            draggable={false}
          />
        ) : (
          /* Placeholder grid */
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>
              No preview
            </span>
          </div>
        )}

        {/* Overlay fade at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 24,
            background: "linear-gradient(to top, #161616, transparent)",
          }}
        />

        {/* Connection handles — all four sides */}
        <Handle type="target" position={Position.Left}   style={{ ...handleStyle, left: -6 }} />
        <Handle type="source" position={Position.Right}  style={{ ...handleStyle, right: -6 }} />
        <Handle type="target" position={Position.Top}    style={{ ...handleStyle, top: -6 }} />
        <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, bottom: -6 }} />
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "8px 10px 9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
          background: "#161616",
        }}
      >
        {editingLabel ? (
          <input
            autoFocus
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => { if (e.key === "Enter") commitLabel(); if (e.key === "Escape") { setEditingLabel(false); setLabelDraft(nodeData.label); } }}
            className="nodrag nopan"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(24,226,153,0.4)",
              color: "#ededed",
              fontSize: "12px",
              fontWeight: 450,
              outline: "none",
              padding: "0 0 1px",
              letterSpacing: "-0.1px",
            }}
          />
        ) : (
          <span
            onDoubleClick={() => { setLabelDraft(nodeData.label); setEditingLabel(true); }}
            title="Double-click to rename"
            style={{
              flex: 1,
              color: "#ededed",
              fontSize: "12px",
              fontWeight: 450,
              letterSpacing: "-0.1px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "default",
            }}
          >
            {nodeData.label}
          </span>
        )}

        {/* Comment badge */}
        {commentCount > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "1px 6px",
              borderRadius: "999px",
              background: "rgba(24,226,153,0.1)",
              border: "1px solid rgba(24,226,153,0.2)",
              color: "#18e299",
              fontSize: "9px",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <path d="M2 2h8a1 1 0 011 1v5a1 1 0 01-1 1H7l-2 2-1-2H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            {commentCount}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(ScreenNodeInner);
