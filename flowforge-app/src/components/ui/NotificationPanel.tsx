"use client";

import React, { useEffect, useRef } from "react";

interface Notification {
  id: string;
  type: "success" | "comment" | "share" | "error";
  title: string;
  project: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: Notification[] = [];

function NotifIcon({ type }: { type: Notification["type"] }) {
  if (type === "success") return (
    <div className="w-8 h-8 rounded-full bg-[rgba(34,197,94,0.12)] flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2.5 7l3 3 6-6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
  if (type === "comment") return (
    <div className="w-8 h-8 rounded-full bg-[rgba(59,130,246,0.12)] flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H8l-2 2-2-2H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#3b82f6" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
  if (type === "share") return (
    <div className="w-8 h-8 rounded-full bg-[rgba(168,85,247,0.12)] flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="11" cy="3" r="1.5" stroke="#a855f7" strokeWidth="1.2" />
        <circle cx="11" cy="11" r="1.5" stroke="#a855f7" strokeWidth="1.2" />
        <circle cx="3" cy="7" r="1.5" stroke="#a855f7" strokeWidth="1.2" />
        <path d="M4.5 7.5l5-3M4.5 6.5l5 3" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.5" stroke="#ef4444" strokeWidth="1.2" />
        <path d="M7 4v3M7 9.5v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-[rgba(0,0,0,0.5)_0px_8px_32px] z-50 overflow-hidden animate-scale-in"
      role="region"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <span className="text-[#ededed]" style={{ fontSize: "14px", fontWeight: 540, letterSpacing: "-0.2px" }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="bg-[#18e299] text-[#0d0d0d] rounded-full px-1.5 py-0.5 leading-none"
              style={{ fontSize: "10px", fontWeight: 600 }}
              aria-label={`${unreadCount} unread`}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <button
          className="text-[#888888] hover:text-[#18e299] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
          style={{ fontSize: "12px", fontWeight: 450 }}
          onClick={() => {}}
          aria-label="Mark all notifications as read"
        >
          Mark all read
        </button>
      </div>

      {/* Notification list */}
      {NOTIFICATIONS.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 gap-2">
          <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[#555555]" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.1px" }}>
            No notifications yet
          </p>
        </div>
      ) : (
        <ul role="list" className="flex flex-col">
          {NOTIFICATIONS.map((notif, i) => (
            <li key={notif.id}>
              <button
                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[rgba(255,255,255,0.04)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                  i < NOTIFICATIONS.length - 1 ? "border-b border-[rgba(255,255,255,0.04)]" : ""
                }`}
              >
                <NotifIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-[#ededed]"
                      style={{ fontSize: "13px", fontWeight: notif.read ? 400 : 500, letterSpacing: "-0.1px", lineHeight: 1.4 }}
                    >
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#18e299] shrink-0 mt-1.5" aria-label="Unread" />
                    )}
                  </div>
                  <p className="text-[#888888] mt-0.5 truncate" style={{ fontSize: "12px", fontWeight: 400 }}>
                    {notif.project}
                  </p>
                  <p
                    className="text-[#666666] mt-0.5"
                    style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                  >
                    {notif.time}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)] text-center">
        <button
          className="text-[#888888] hover:text-[#18e299] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
          style={{ fontSize: "12px", fontWeight: 400 }}
          aria-label="View all notifications"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
