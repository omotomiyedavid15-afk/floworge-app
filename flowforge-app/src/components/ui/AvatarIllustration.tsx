"use client";

import React from "react";

// ── Avatar definitions ────────────────────────────────────────────────────────
//
// Google-style flat illustrated portrait avatars.
// 100×100 viewBox. Layers: bg → clothing → neck → hair-back → face → hair-top → extras
//

export interface AvatarDef {
  id: number;
  name: string;
  bg: string;
  clothing: string;
  skin: string;
  render: () => React.ReactNode;
}

// ── Shared face helper ───────────────────────────────────────────────────────
// Clean, Google-style: flat skin, dot eyes with highlights, subtle brows + smile.

function face(skin: string, brow = "#1a1a1a", extras?: React.ReactNode) {
  return (
    <>
      {/* Neck */}
      <rect x="44" y="74" width="12" height="12" fill={skin} />
      {/* Ears */}
      <ellipse cx="29" cy="56" rx="3.2" ry="4" fill={skin} />
      <ellipse cx="71" cy="56" rx="3.2" ry="4" fill={skin} />
      {/* Head */}
      <ellipse cx="50" cy="54" rx="21" ry="24" fill={skin} />
      {/* Eyebrows */}
      <path d="M39.5 47 Q43 45.5 46.5 47" stroke={brow} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M53.5 47 Q57 45.5 60.5 47" stroke={brow} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.75" />
      {/* Eyes */}
      <circle cx="43" cy="53" r="2.6" fill="#1a1a1a" />
      <circle cx="57" cy="53" r="2.6" fill="#1a1a1a" />
      <circle cx="44.1" cy="51.8" r="0.9" fill="white" />
      <circle cx="58.1" cy="51.8" r="0.9" fill="white" />
      {/* Nose — tiny nostrils hint */}
      <circle cx="48" cy="61" r="1" fill="rgba(0,0,0,0.1)" />
      <circle cx="52" cy="61" r="1" fill="rgba(0,0,0,0.1)" />
      {/* Smile */}
      <path d="M44.5 66.5 Q50 71 55.5 66.5" stroke="rgba(0,0,0,0.22)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      {extras}
    </>
  );
}

// ── Clothing shape ────────────────────────────────────────────────────────────

function clothing(color: string, skin: string, neckStyle: "round" | "v" | "collar" = "round") {
  return (
    <>
      <path d="M5 100 Q5 84 50 78 Q95 84 95 100 Z" fill={color} />
      {neckStyle === "round" && (
        <ellipse cx="50" cy="81" rx="11" ry="7" fill={skin} />
      )}
      {neckStyle === "v" && (
        <path d="M44 78 L50 88 L56 78" fill={skin} />
      )}
      {neckStyle === "collar" && (
        <>
          <path d="M38 80 Q50 90 62 80" fill="white" opacity="0.9" />
          <path d="M38 80 L44 78 L50 88 L56 78 L62 80 Q50 92 38 80 Z" fill="white" opacity="0.9" />
        </>
      )}
    </>
  );
}

// ── 16 avatars ────────────────────────────────────────────────────────────────

export const AVATARS: AvatarDef[] = [

  // 0 ── Ash — short neat dark hair, medium-light skin, blue bg
  {
    id: 0, name: "Ash",
    bg: "#BBDEFB", clothing: "#1565C0", skin: "#D4956E",
    render: () => (
      <>
        {clothing("#1565C0", "#D4956E")}
        {face("#D4956E")}
        {/* Short side coverage */}
        <rect x="28" y="42" width="5" height="15" rx="2.5" fill="#1a1a1a" />
        <rect x="67" y="42" width="5" height="15" rx="2.5" fill="#1a1a1a" />
        {/* Top hair cap */}
        <ellipse cx="50" cy="36" rx="22" ry="14" fill="#1a1a1a" />
        <rect x="28" y="30" width="44" height="12" rx="6" fill="#1a1a1a" />
      </>
    ),
  },

  // 1 ── Bree — long blonde hair, light skin, warm yellow bg
  {
    id: 1, name: "Bree",
    bg: "#FFF8E1", clothing: "#E65100", skin: "#FDDBB4",
    render: () => (
      <>
        {clothing("#E65100", "#FDDBB4")}
        {/* Long hair behind — left and right panels */}
        <rect x="22" y="40" width="11" height="55" rx="5.5" fill="#D4A017" />
        <rect x="67" y="40" width="11" height="55" rx="5.5" fill="#D4A017" />
        {face("#FDDBB4")}
        {/* Top hair */}
        <ellipse cx="50" cy="36" rx="23" ry="14" fill="#F5B800" />
        <ellipse cx="50" cy="32" rx="20" ry="10" fill="#F5B800" />
      </>
    ),
  },

  // 2 ── Cleo — afro, deep brown skin, sage green bg
  {
    id: 2, name: "Cleo",
    bg: "#C8E6C9", clothing: "#1B5E20", skin: "#3C1A0E",
    render: () => (
      <>
        {clothing("#1B5E20", "#3C1A0E")}
        {face("#3C1A0E", "#0a0a0a")}
        {/* Afro — outer ring + fill */}
        <circle cx="50" cy="44" r="28" fill="#1a0e06" />
        <circle cx="50" cy="44" r="25" fill="#2a1508" />
        {/* Afro sheen highlight */}
        <ellipse cx="44" cy="30" rx="7" ry="4" fill="#3a2010" opacity="0.6" />
      </>
    ),
  },

  // 3 ── Dana — curly auburn bob, fair skin, teal bg
  {
    id: 3, name: "Dana",
    bg: "#B2DFDB", clothing: "#B71C1C", skin: "#F5C5A3",
    render: () => (
      <>
        {clothing("#B71C1C", "#F5C5A3")}
        {/* Curly side volumes */}
        <ellipse cx="29" cy="52" rx="7" ry="17" fill="#A0330A" />
        <ellipse cx="71" cy="52" rx="7" ry="17" fill="#A0330A" />
        {face("#F5C5A3", "#1a1a1a",
          /* freckles */
          <>
            <circle cx="42" cy="62" r="1.1" fill="#C68642" opacity="0.35" />
            <circle cx="45.5" cy="64" r="1.1" fill="#C68642" opacity="0.35" />
            <circle cx="54.5" cy="64" r="1.1" fill="#C68642" opacity="0.35" />
            <circle cx="58" cy="62" r="1.1" fill="#C68642" opacity="0.35" />
          </>
        )}
        {/* Curly top */}
        <ellipse cx="50" cy="36" rx="23" ry="15" fill="#B83A0A" />
        {[30, 39, 48, 57, 66].map((x, i) => (
          <circle key={i} cx={x} cy={32} r="7" fill="#A02808" />
        ))}
      </>
    ),
  },

  // 4 ── Ellis — short tidy hair + glasses, medium skin, purple bg
  {
    id: 4, name: "Ellis",
    bg: "#E1BEE7", clothing: "#4A148C", skin: "#C68642",
    render: () => (
      <>
        {clothing("#4A148C", "#C68642")}
        {face("#C68642", "#1a1a1a",
          /* Glasses */
          <>
            <rect x="35" y="50" width="13" height="9" rx="3" stroke="#222" strokeWidth="1.6" fill="rgba(160,200,255,0.18)" />
            <rect x="52" y="50" width="13" height="9" rx="3" stroke="#222" strokeWidth="1.6" fill="rgba(160,200,255,0.18)" />
            <line x1="48" y1="54.5" x2="52" y2="54.5" stroke="#222" strokeWidth="1.6" />
            <line x1="35" y1="54.5" x2="31" y2="56" stroke="#222" strokeWidth="1.6" />
            <line x1="65" y1="54.5" x2="69" y2="56" stroke="#222" strokeWidth="1.6" />
          </>
        )}
        {/* Short neat hair */}
        <rect x="28" y="36" width="5" height="14" rx="2.5" fill="#2a1a0e" />
        <rect x="67" y="36" width="5" height="14" rx="2.5" fill="#2a1a0e" />
        <ellipse cx="50" cy="35" rx="22" ry="13" fill="#2a1a0e" />
        <rect x="28" y="28" width="44" height="11" rx="5.5" fill="#2a1a0e" />
      </>
    ),
  },

  // 5 ── Faye — high bun, medium-dark skin, peach bg
  {
    id: 5, name: "Faye",
    bg: "#FFCCBC", clothing: "#BF360C", skin: "#A0522D",
    render: () => (
      <>
        {clothing("#BF360C", "#A0522D")}
        {face("#A0522D")}
        {/* Bun base hair */}
        <ellipse cx="50" cy="42" rx="22" ry="12" fill="#2D1B0E" />
        <rect x="28" y="42" width="4" height="14" rx="2" fill="#2D1B0E" />
        <rect x="68" y="42" width="4" height="14" rx="2" fill="#2D1B0E" />
        {/* Bun */}
        <circle cx="50" cy="26" r="11" fill="#3B2314" />
        <circle cx="50" cy="26" r="8" fill="#2D1B0E" />
        {/* Wrap line */}
        <path d="M42 26 Q50 20 58 26" stroke="#4a2e14" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    ),
  },

  // 6 ── Gray — wavy shoulder-length, medium skin, sky blue bg
  {
    id: 6, name: "Gray",
    bg: "#B3E5FC", clothing: "#01579B", skin: "#C68642",
    render: () => (
      <>
        {clothing("#01579B", "#C68642")}
        {/* Wavy side hair */}
        <path d="M27 42 C23 52 25 62 27 70 C29 78 25 84 27 92" stroke="#5A3010" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M73 42 C77 52 75 62 73 70 C71 78 75 84 73 92" stroke="#5A3010" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {face("#C68642")}
        {/* Top wavy hair */}
        <ellipse cx="50" cy="37" rx="23" ry="15" fill="#6B3A1A" />
        <path d="M27 37 Q33 30 40 37 Q46 30 50 37 Q54 30 60 37 Q67 30 73 37"
          stroke="#5A2A10" strokeWidth="10" fill="none" strokeLinecap="round" />
      </>
    ),
  },

  // 7 ── Hana — long braids, dark brown skin, indigo bg
  {
    id: 7, name: "Hana",
    bg: "#C5CAE9", clothing: "#1A237E", skin: "#5C3317",
    render: () => (
      <>
        {clothing("#1A237E", "#5C3317")}
        {/* Braids */}
        <rect x="24" y="44" width="9" height="56" rx="4.5" fill="#1A0E08" />
        <rect x="67" y="44" width="9" height="56" rx="4.5" fill="#1A0E08" />
        {/* Braid segment marks */}
        {[52, 61, 70, 79, 88].map(y => (
          <React.Fragment key={y}>
            <line x1="25" y1={y} x2="32" y2={y} stroke="#2a1408" strokeWidth="1.3" opacity="0.7" />
            <line x1="68" y1={y} x2="75" y2={y} stroke="#2a1408" strokeWidth="1.3" opacity="0.7" />
          </React.Fragment>
        ))}
        {face("#5C3317", "#0a0a0a")}
        {/* Top hair + part */}
        <ellipse cx="50" cy="37" rx="23" ry="15" fill="#1A0E08" />
        <rect x="28" y="26" width="44" height="13" rx="6.5" fill="#1A0E08" />
        <line x1="50" y1="22" x2="50" y2="40" stroke="#2a1408" strokeWidth="1" opacity="0.6" />
      </>
    ),
  },

  // 8 ── Ike — spiky hair, light skin, lime bg
  {
    id: 8, name: "Ike",
    bg: "#DCEDC8", clothing: "#33691E", skin: "#FDDBB4",
    render: () => (
      <>
        {clothing("#33691E", "#FDDBB4")}
        {face("#FDDBB4")}
        {/* Spiky hair base */}
        <ellipse cx="50" cy="40" rx="22" ry="12" fill="#1a1a1a" />
        {/* Spikes */}
        {[-16, -8, 0, 8, 16].map((offset, i) => (
          <polygon key={i}
            points={`${50 + offset - 5},38 ${50 + offset},18 ${50 + offset + 5},38`}
            fill="#1a1a1a" />
        ))}
        {/* Side spikes */}
        <polygon points="28,46 22,30 35,44" fill="#1a1a1a" />
        <polygon points="72,46 78,30 65,44" fill="#1a1a1a" />
      </>
    ),
  },

  // 9 ── Jay — short fade, medium-dark skin, rose bg
  {
    id: 9, name: "Jay",
    bg: "#FFCDD2", clothing: "#B71C1C", skin: "#8D5524",
    render: () => (
      <>
        {clothing("#B71C1C", "#8D5524")}
        {face("#8D5524")}
        {/* Fade — very close-cut */}
        <rect x="28" y="40" width="5" height="12" rx="2.5" fill="#1A0E06" />
        <rect x="67" y="40" width="5" height="12" rx="2.5" fill="#1A0E06" />
        <ellipse cx="50" cy="37" rx="22" ry="12" fill="#1A0E06" />
        <rect x="28" y="28" width="44" height="12" rx="6" fill="#1A0E06" />
        {/* Fade gradient — lighter at sides */}
        <rect x="28" y="44" width="5" height="8" rx="2.5" fill="#1A0E06" opacity="0.4" />
        <rect x="67" y="44" width="5" height="8" rx="2.5" fill="#1A0E06" opacity="0.4" />
      </>
    ),
  },

  // 10 ── Kai — straight shoulder-length hair, medium skin, pink bg
  {
    id: 10, name: "Kai",
    bg: "#F8BBD0", clothing: "#880E4F", skin: "#C9956C",
    render: () => (
      <>
        {clothing("#880E4F", "#C9956C")}
        {/* Shoulder-length side panels */}
        <rect x="24" y="40" width="11" height="46" rx="5.5" fill="#1A0E06" />
        <rect x="65" y="40" width="11" height="46" rx="5.5" fill="#1A0E06" />
        {face("#C9956C")}
        {/* Top hair */}
        <ellipse cx="50" cy="36" rx="23" ry="14" fill="#1A0E06" />
        <rect x="27" y="26" width="46" height="13" rx="6.5" fill="#1A0E06" />
      </>
    ),
  },

  // 11 ── Lane — beanie hat, light skin, blue-grey bg
  {
    id: 11, name: "Lane",
    bg: "#CFD8DC", clothing: "#37474F", skin: "#F5C5A3",
    render: () => (
      <>
        {clothing("#37474F", "#F5C5A3")}
        {face("#F5C5A3")}
        {/* Beanie body */}
        <ellipse cx="50" cy="44" rx="23" ry="8" fill="#C62828" />
        <ellipse cx="50" cy="37" rx="22" ry="16" fill="#D32F2F" />
        <ellipse cx="50" cy="24" rx="19" ry="14" fill="#D32F2F" />
        {/* Beanie ribbing lines */}
        {[40, 43, 46].map(y => (
          <path key={y} d={`M28 ${y} Q50 ${y - 2} 72 ${y}`}
            stroke="#B71C1C" strokeWidth="1.2" fill="none" opacity="0.7" />
        ))}
        {/* Pom pom */}
        <circle cx="50" cy="13" r="7" fill="#ECEFF1" />
        <circle cx="50" cy="13" r="5" fill="#F5F5F5" />
      </>
    ),
  },

  // 12 ── Mars — freeform locs, deep dark skin, amber bg
  {
    id: 12, name: "Mars",
    bg: "#FFE0B2", clothing: "#E65100", skin: "#2D160A",
    render: () => (
      <>
        {clothing("#E65100", "#2D160A")}
        {/* Locs — hanging from top */}
        {[-14, -6, 2, 10, 18].map((offset, i) => (
          <path key={i}
            d={`M${49 + offset} 42 Q${47 + offset} 65 ${49 + offset} 88`}
            stroke="#1A0E06" strokeWidth="6" fill="none" strokeLinecap="round" />
        ))}
        {[-10, -2, 6, 14].map((offset, i) => (
          <path key={i}
            d={`M${49 + offset} 42 Q${47 + offset} 65 ${49 + offset} 88`}
            stroke="#2a1408" strokeWidth="2" fill="none" strokeLinecap="round" />
        ))}
        {face("#2D160A", "#0a0a0a")}
        {/* Loc crown */}
        <ellipse cx="50" cy="38" rx="24" ry="15" fill="#1A0E06" />
        <rect x="26" y="26" width="48" height="14" rx="7" fill="#1A0E06" />
      </>
    ),
  },

  // 13 ── Nova — side-swept hair, medium skin, cyan bg
  {
    id: 13, name: "Nova",
    bg: "#B2EBF2", clothing: "#006064", skin: "#C09060",
    render: () => (
      <>
        {clothing("#006064", "#C09060")}
        {/* Long swept side — right */}
        <path d="M73 42 C79 56 77 70 73 84 C71 90 74 96 73 100"
          stroke="#4A2A0A" strokeWidth="10" fill="none" strokeLinecap="round" />
        {face("#C09060")}
        {/* Swept top — left-leaning part */}
        <path d="M25 42 Q25 32 50 30 Q68 29 73 38 Q65 46 50 46 Q32 46 28 54"
          fill="#4A2A0A" />
        <path d="M25 42 Q22 34 28 30 Q35 26 50 30"
          fill="#3A1A06" />
        <rect x="25" y="42" width="4" height="16" rx="2" fill="#4A2A0A" />
      </>
    ),
  },

  // 14 ── Orla — headband + straight dark hair, light skin, deep-purple bg
  {
    id: 14, name: "Orla",
    bg: "#D1C4E9", clothing: "#311B92", skin: "#FDDBB4",
    render: () => (
      <>
        {clothing("#311B92", "#FDDBB4")}
        {/* Long straight side panels */}
        <rect x="22" y="42" width="11" height="55" rx="5.5" fill="#1a1a1a" />
        <rect x="67" y="42" width="11" height="55" rx="5.5" fill="#1a1a1a" />
        {face("#FDDBB4")}
        {/* Top hair */}
        <ellipse cx="50" cy="37" rx="24" ry="14" fill="#1a1a1a" />
        <rect x="26" y="26" width="48" height="13" rx="6.5" fill="#1a1a1a" />
        {/* Headband */}
        <path d="M26 46 Q50 42 74 46" stroke="#E91E63" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M26 46 Q50 42 74 46" stroke="#F06292" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
  },

  // 15 ── Reed — textured coily hair, medium-dark skin, warm orange bg
  {
    id: 15, name: "Reed",
    bg: "#FFF3E0", clothing: "#BF360C", skin: "#8D5524",
    render: () => (
      <>
        {clothing("#BF360C", "#8D5524")}
        {face("#8D5524")}
        {/* Coily/textured hair — outer shape */}
        <ellipse cx="50" cy="38" rx="26" ry="22" fill="#2A1408" />
        {/* Coil texture — small overlapping circles */}
        {([
          [35, 28], [42, 23], [50, 21], [58, 23], [65, 28],
          [32, 36], [40, 31], [50, 30], [60, 31], [68, 36],
          [30, 44], [38, 40], [62, 40], [70, 44],
        ] as [number, number][]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="5" fill="#1A0E06" />
        ))}
        {/* Re-draw ears over hair */}
        <ellipse cx="29" cy="56" rx="3.2" ry="4" fill="#8D5524" />
        <ellipse cx="71" cy="56" rx="3.2" ry="4" fill="#8D5524" />
      </>
    ),
  },
];

// ── Avatar component ──────────────────────────────────────────────────────────

export interface AvatarIllustrationProps {
  avatarId: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AvatarIllustration({
  avatarId,
  size = 40,
  className,
  style,
}: AvatarIllustrationProps) {
  const avatar = AVATARS[avatarId] ?? AVATARS[0];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-label={`Avatar: ${avatar.name}`}
    >
      <defs>
        <clipPath id={`av-clip-${avatar.id}`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      {/* Circular background */}
      <circle cx="50" cy="50" r="50" fill={avatar.bg} />
      {/* Portrait — clipped to circle */}
      <g clipPath={`url(#av-clip-${avatar.id})`}>
        {avatar.render()}
      </g>
      {/* Subtle inner ring */}
      <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
    </svg>
  );
}

// ── Avatar picker ─────────────────────────────────────────────────────────────

export function AvatarPicker({
  selected,
  onChange,
}: {
  selected: number;
  onChange: (id: number) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose an avatar"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: "10px",
      }}
    >
      {AVATARS.map((av) => {
        const isSelected = selected === av.id;
        return (
          <button
            key={av.id}
            role="radio"
            aria-checked={isSelected}
            aria-label={av.name}
            title={av.name}
            onClick={() => onChange(av.id)}
            style={{
              padding: "3px",
              borderRadius: "50%",
              border: isSelected ? "2.5px solid #18e299" : "2.5px solid transparent",
              background: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: isSelected ? "0 0 0 3px rgba(24,226,153,0.2)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AvatarIllustration
              avatarId={av.id}
              size={52}
              style={{ borderRadius: "50%", overflow: "hidden" }}
            />
          </button>
        );
      })}
    </div>
  );
}
