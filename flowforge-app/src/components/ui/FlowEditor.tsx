"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ScreenNode from "./ScreenNode";
import FlowEdge, { type ConditionType, type FlowEdgeData } from "./FlowEdge";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FlowComment {
  id: string;
  text: string;
  condition: ConditionType | null;
  createdAt: string;
}

const CONDITION_OPTIONS: { value: ConditionType | null; label: string; color: string }[] = [
  { value: null,      label: "Note",  color: "#888888" },
  { value: "yes",     label: "Yes",   color: "#18e299" },
  { value: "no",      label: "No",    color: "#f87171" },
  { value: "error",   label: "Error", color: "#eab308" },
  { value: "info",    label: "Info",  color: "#60a5fa" },
];

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_NODES: Node[] = [
  {
    id: "start",
    type: "screen",
    data: { label: "Start", nodeType: "start", comments: [] },
    position: { x: 80, y: 240 },
  },
  {
    id: "n1",
    type: "screen",
    data: {
      label: "Login Screen",
      imageUrl: null,
      comments: [
        { id: "c1", text: "User enters credentials and taps Sign In.", condition: null, createdAt: "2 min ago" },
        { id: "c2", text: "If credentials are wrong, show inline error and allow retry.", condition: "no", createdAt: "5 min ago" },
      ],
    },
    position: { x: 320, y: 160 },
  },
  {
    id: "n2",
    type: "screen",
    data: { label: "Dashboard", imageUrl: null, comments: [] },
    position: { x: 620, y: 80 },
  },
  {
    id: "n3",
    type: "screen",
    data: {
      label: "Onboarding",
      imageUrl: null,
      comments: [
        { id: "c3", text: "First-time user flow — collect role and preferences.", condition: "info", createdAt: "10 min ago" },
      ],
    },
    position: { x: 620, y: 310 },
  },
  {
    id: "end",
    type: "screen",
    data: { label: "End", nodeType: "end", comments: [] },
    position: { x: 900, y: 190 },
  },
];

function makeEdge(id: string, source: string, target: string, label: string, condition: ConditionType): Edge {
  return {
    id,
    source,
    target,
    type: "flowEdge",
    data: { label, condition } as FlowEdgeData,
    markerEnd: { type: MarkerType.ArrowClosed, color: condition === "yes" ? "#18e299" : condition === "no" ? "#f87171" : condition === "error" ? "#eab308" : "rgba(255,255,255,0.3)", width: 14, height: 14 },
  };
}

const SEED_EDGES: Edge[] = [
  makeEdge("e-start-n1", "start", "n1", "", "default"),
  makeEdge("e-n1-n2", "n1", "n2", "Success", "yes"),
  makeEdge("e-n1-n3", "n1", "n3", "First time", "info"),
  makeEdge("e-n2-end", "n2", "end", "", "default"),
  makeEdge("e-n3-n2", "n3", "n2", "Complete", "yes"),
];

const nodeTypes = { screen: ScreenNode };
const edgeTypes = { flowEdge: FlowEdge };

// ── Comment panel ─────────────────────────────────────────────────────────────

function CommentPanel({
  node,
  onClose,
  onAddComment,
  onDeleteComment,
}: {
  node: Node;
  onClose: () => void;
  onAddComment: (nodeId: string, comment: FlowComment) => void;
  onDeleteComment: (nodeId: string, commentId: string) => void;
}) {
  const [text, setText] = useState("");
  const [condition, setCondition] = useState<ConditionType | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const comments: FlowComment[] = (node.data as any).comments ?? [];

  function handleAdd() {
    if (!text.trim()) return;
    onAddComment(node.id, {
      id: `c-${Date.now()}`,
      text: text.trim(),
      condition,
      createdAt: "just now",
    });
    setText("");
    setCondition(null);
  }

  const conditionColor = CONDITION_OPTIONS.find((c) => c.value === condition)?.color ?? "#888888";

  return (
    <div
      style={{
        width: 288,
        height: "100%",
        background: "#141414",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ color: "#ededed", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.15px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {(node.data as any).label}
          </p>
          <p style={{ color: "#555", fontSize: "11px", fontWeight: 330, margin: "2px 0 0", letterSpacing: "-0.05px" }}>
            {comments.length} use case{comments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ color: "#555", background: "none", border: "none", cursor: "pointer", padding: "2px", flexShrink: 0, borderRadius: "4px", display: "flex" }}
          aria-label="Close panel"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Comments list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#444" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ margin: "0 auto 10px", display: "block", opacity: 0.5 }}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <p style={{ fontSize: "12px", fontWeight: 330, margin: 0, lineHeight: 1.6 }}>
              No use cases yet.<br />Add one below.
            </p>
          </div>
        ) : (
          comments.map((c) => {
            const cfg = CONDITION_OPTIONS.find((o) => o.value === c.condition) ?? CONDITION_OPTIONS[0];
            return (
              <div
                key={c.id}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  position: "relative",
                }}
              >
                {/* Condition badge */}
                {c.condition && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "1px 7px",
                      borderRadius: "999px",
                      background: `${cfg.color}15`,
                      border: `1px solid ${cfg.color}40`,
                      color: cfg.color,
                      fontSize: "10px",
                      fontWeight: 500,
                      letterSpacing: "-0.05px",
                    }}
                  >
                    <span style={{ fontSize: "9px" }}>
                      {c.condition === "yes" ? "✓" : c.condition === "no" ? "✕" : c.condition === "error" ? "⚠" : "ℹ"}
                    </span>
                    {cfg.label}
                  </span>
                )}
                <p style={{ color: "#ccc", fontSize: "12px", fontWeight: 330, margin: 0, lineHeight: 1.6, letterSpacing: "-0.05px" }}>
                  {c.text}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "#444", fontSize: "10px", fontWeight: 320, letterSpacing: "0.1px", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
                    {c.createdAt}
                  </span>
                  <button
                    onClick={() => onDeleteComment(node.id, c.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#444", padding: "2px", borderRadius: "3px", display: "flex" }}
                    aria-label="Delete comment"
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add comment form */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <p style={{ color: "#666", fontSize: "10px", fontWeight: 400, letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono, monospace)", margin: 0 }}>
          Add use case
        </p>
        <textarea
          ref={textRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd(); }}
          placeholder="Describe what happens at this screen…"
          rows={3}
          style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            color: "#ededed",
            fontSize: "12px",
            fontWeight: 330,
            letterSpacing: "-0.05px",
            lineHeight: 1.6,
            padding: "8px 10px",
            resize: "none",
            outline: "none",
            fontFamily: "var(--font-inter, sans-serif)",
          }}
        />

        {/* Condition selector */}
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {CONDITION_OPTIONS.map((opt) => (
            <button
              key={opt.value ?? "null"}
              onClick={() => setCondition(condition === opt.value ? null : opt.value)}
              style={{
                padding: "3px 9px",
                borderRadius: "999px",
                border: `1px solid ${condition === opt.value ? `${opt.color}60` : "rgba(255,255,255,0.08)"}`,
                background: condition === opt.value ? `${opt.color}14` : "transparent",
                color: condition === opt.value ? opt.color : "#555",
                fontSize: "10px",
                fontWeight: condition === opt.value ? 500 : 400,
                cursor: "pointer",
                transition: "all 0.1s",
                letterSpacing: "-0.05px",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          style={{
            padding: "7px 12px",
            borderRadius: "8px",
            background: text.trim() ? "#ededed" : "rgba(255,255,255,0.06)",
            color: text.trim() ? "#0d0d0d" : "#444",
            fontSize: "12px",
            fontWeight: 500,
            border: "none",
            cursor: text.trim() ? "pointer" : "not-allowed",
            transition: "all 0.15s",
            letterSpacing: "-0.1px",
          }}
        >
          Add use case
        </button>
      </div>
    </div>
  );
}

// ── Flow name editor ───────────────────────────────────────────────────────────

function FlowNameEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    setEditing(false);
    if (draft.trim()) onChange(draft.trim());
    else setDraft(value);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(24,226,153,0.4)",
          color: "#ededed",
          fontSize: "13px",
          fontWeight: 450,
          letterSpacing: "-0.1px",
          outline: "none",
          padding: "0 0 1px",
          width: "160px",
        }}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      style={{
        background: "none",
        border: "none",
        color: "#ededed",
        fontSize: "13px",
        fontWeight: 450,
        letterSpacing: "-0.1px",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
      title="Click to rename"
    >
      {value}
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#555" strokeWidth="1.3">
        <path d="M8 1.5l2.5 2.5-6 6H2V7.5l6-6z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

function FlowEditorInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(SEED_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(SEED_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState("Untitled flow");
  const [saved, setSaved] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  // ── Connections ──
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "flowEdge",
            data: { label: "", condition: "default" } as FlowEdgeData,
            markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.3)", width: 14, height: 14 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // ── Node selection ──
  const onNodeClick: NodeMouseHandler = useCallback((_e, node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  // ── Add nodes ──
  function addScreenNode() {
    const id = `n-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "screen",
        data: { label: "New Screen", imageUrl: null, comments: [] },
        position: {
          x: 200 + Math.random() * 300,
          y: 150 + Math.random() * 200,
        },
      },
    ]);
  }

  function addStartNode() {
    const id = `start-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      { id, type: "screen", data: { label: "Start", nodeType: "start", comments: [] }, position: { x: 80, y: 200 + Math.random() * 100 } },
    ]);
  }

  function addEndNode() {
    const id = `end-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      { id, type: "screen", data: { label: "End", nodeType: "end", comments: [] }, position: { x: 800, y: 200 + Math.random() * 100 } },
    ]);
  }

  // ── Comments ──
  function handleAddComment(nodeId: string, comment: FlowComment) {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, comments: [...((n.data as any).comments ?? []), comment] } }
          : n
      )
    );
  }

  function handleDeleteComment(nodeId: string, commentId: string) {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, comments: ((n.data as any).comments ?? []).filter((c: FlowComment) => c.id !== commentId) } }
          : n
      )
    );
  }

  // ── Save ──
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#0d0d0d" }}>

      {/* ── Top toolbar ── */}
      <div
        style={{
          height: 44,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#141414",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* Flow name */}
        <FlowNameEditor value={flowName} onChange={setFlowName} />

        <div style={{ flex: 1 }} />

        {/* Node count */}
        <span style={{ color: "#444", fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
          {nodes.length} nodes · {edges.length} edges
        </span>

        {/* Save */}
        <button
          onClick={handleSave}
          style={{
            padding: "5px 14px",
            borderRadius: "999px",
            background: saved ? "rgba(24,226,153,0.12)" : "#ededed",
            border: saved ? "1px solid rgba(24,226,153,0.3)" : "none",
            color: saved ? "#18e299" : "#0d0d0d",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
            letterSpacing: "-0.1px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {saved ? (
            <>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Saved
            </>
          ) : "Save flow"}
        </button>
      </div>

      {/* ── Canvas + side panel ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Left toolbar */}
        <div
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "8px 6px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {[
            {
              label: "Screen", title: "Add screen node", onClick: addScreenNode,
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></svg>,
            },
            {
              label: "Start", title: "Add start node", onClick: addStartNode,
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" /></svg>,
            },
            {
              label: "End", title: "Add end node", onClick: addEndNode,
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" stroke="none" /></svg>,
            },
          ].map(({ label, title, onClick, icon }) => (
            <button
              key={label}
              onClick={onClick}
              title={title}
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "transparent",
                border: "1px solid transparent",
                color: "#888",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget.style.background = "rgba(255,255,255,0.06)"); (e.currentTarget.style.color = "#ededed"); }}
              onMouseLeave={(e) => { (e.currentTarget.style.background = "transparent"); (e.currentTarget.style.color = "#888"); }}
            >
              {icon}
              <span style={{ fontSize: "8px", fontWeight: 400, letterSpacing: "0.3px", textTransform: "uppercase", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
                {label}
              </span>
            </button>
          ))}

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "2px 4px" }} />

          {/* Help tip */}
          <div
            title="Drag from a handle to another node to connect. Right-click an edge label to change condition."
            style={{
              width: 38,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "help",
              color: "#333",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
              <path d="M7 9.5v.5M7 4.5c0-1 .7-1.5 1.5-1C9.5 4 9.5 5 8.5 6S7 7.5 7 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* ReactFlow canvas */}
        <div style={{ flex: 1, height: "100%" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            colorMode="dark"
            deleteKeyCode="Delete"
            defaultEdgeOptions={{ type: "flowEdge" }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              color="rgba(255,255,255,0.04)"
              gap={24}
              size={1}
              variant={BackgroundVariant.Dots}
            />
            <Controls
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            />
            <MiniMap
              nodeColor={(n) => {
                const d = n.data as any;
                if (d.nodeType === "start") return "#18e299";
                if (d.nodeType === "end") return "#f87171";
                return "#888";
              }}
              maskColor="rgba(0,0,0,0.6)"
              style={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
              }}
            />
          </ReactFlow>
        </div>

        {/* Comment / annotation panel */}
        {selectedNode && (
          <CommentPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>

      {/* ── Hint bar ── */}
      <div
        style={{
          height: 26,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "#111",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "16px",
        }}
      >
        {[
          "Drag handles to connect",
          "Click node to annotate",
          "Double-click label to rename",
          "Right-click edge to change condition",
          "Delete key removes selected",
        ].map((tip, i) => (
          <span
            key={i}
            style={{ color: "#333", fontSize: "10px", fontWeight: 330, letterSpacing: "-0.03px", display: "flex", alignItems: "center", gap: "5px" }}
          >
            {i > 0 && <span style={{ color: "#222" }}>·</span>}
            {tip}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}
