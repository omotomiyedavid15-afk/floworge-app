"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import FlowEditor from "@/components/ui/FlowEditor";
import Link from "next/link";

const SCREENS = [
  { id: "login",      name: "Login Screen",          status: "done"       as const },
  { id: "dashboard",  name: "Dashboard · Home",       status: "done"       as const },
  { id: "onboarding", name: "Onboarding · Welcome",   status: "processing" as const },
  { id: "settings",   name: "Settings",               status: "queued"     as const },
];

export default function FlowsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      <Sidebar 
        projectName="Mobile Banking App"
        screens={SCREENS}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Breadcrumb Header */}
        <header className="flex items-center justify-between h-11 px-4 bg-[#141414] border-b border-[rgba(255,255,255,0.06)] shrink-0 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-[#888888] hover:text-[#ededed] transition-colors shrink-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
            >
              Dashboard
            </Link>
            <span className="text-[rgba(255,255,255,0.2)]" aria-hidden="true">/</span>
            <span className="text-[#ededed] truncate" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
              Mobile Banking App
            </span>
            <span className="text-[rgba(255,255,255,0.2)]" aria-hidden="true">/</span>
            <span className="text-[#18e299] truncate" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
              User Flows
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[#888888] text-[11px] font-mono uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
              Beta
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <FlowEditor />
        </main>
      </div>
    </div>
  );
}
