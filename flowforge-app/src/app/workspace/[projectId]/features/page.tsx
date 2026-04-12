"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'review' | 'ready' | 'shipped';
  screens: string[];
}

const INITIAL_FEATURES: Feature[] = [
  {
    id: "f1",
    name: "User Authentication",
    description: "Handle secure user sign-up, log-in, and password recovery flows.",
    status: "ready",
    screens: ["login", "onboarding"],
  },
  {
    id: "f2",
    name: "Dashboard Home",
    description: "The main entry point for logged-in users, displaying financial summaries.",
    status: "shipped",
    screens: ["dashboard"],
  },
];

const STATUS_COLORS = {
  draft: "text-gray-400 bg-gray-400/10",
  review: "text-yellow-400 bg-yellow-400/10",
  ready: "text-[#18e299] bg-[#18e299]/10",
  shipped: "text-blue-400 bg-blue-400/10",
};

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>(INITIAL_FEATURES);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      <Sidebar 
        projectName="Mobile Banking App"
        screens={[]} // Sidebar can be empty or show screens for context
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-11 px-4 bg-[#141414] border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-[#888888] hover:text-[#ededed] text-[13px]">
              Dashboard
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-[#ededed] text-[13px]">Mobile Banking App</span>
            <span className="text-white/20">/</span>
            <span className="text-[#18e299] text-[13px]">Feature Docs</span>
          </div>
          <Button variant="black-pill" size="sm">
            Create Feature
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#0d0d0d]">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-medium text-[#ededed] tracking-tight">
                Feature Documentation
              </h1>
              <p className="text-[#888888] text-sm max-w-2xl font-light leading-relaxed">
                Automatically grouped screens by AI into logical product features. 
                Manage specifications, edge cases, and development status here.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  className="bg-[#141414] border border-white/5 rounded-xl p-6 hover:border-[#18e299]/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-medium text-[#ededed] group-hover:text-[#18e299] transition-colors">
                        {feature.name}
                      </h2>
                      <p className="text-[#888888] text-sm font-light">
                        {feature.description}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${STATUS_COLORS[feature.status]}`}>
                      {feature.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest">
                      Associated Screens
                    </label>
                    <div className="flex gap-2">
                      {feature.screens.map((screenId) => (
                        <div 
                          key={screenId}
                          className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[12px] text-[#888888] flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#18e299]" />
                          {screenId.charAt(0).toUpperCase() + screenId.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
                    <button className="text-[12px] text-[#888888] hover:text-[#ededed] transition-colors font-light">
                      View Specs
                    </button>
                    <button className="text-[12px] text-[#888888] hover:text-[#ededed] transition-colors font-light">
                      Flow Map
                    </button>
                    <button className="text-[12px] text-red-400/60 hover:text-red-400 transition-colors font-light ml-auto">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
