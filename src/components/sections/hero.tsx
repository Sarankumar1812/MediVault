"use client"

import { useState } from "react"
import Image from "next/image"

interface HeroProps {
  onCTAClick: () => void
}

export default function Hero({ onCTAClick }: HeroProps) {
  const [hovered, setHovered] = useState<"glucose" | "oxygen" | null>(null)

  return (
    <section
      id="home"
      className="relative w-full min-h-screen overflow-hidden"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/hero.png"
          alt="Healthcare background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-40 min-h-screen flex flex-col justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-800 text-primary leading-tight mb-6">
          Your Health Records.
          <br />
          Securely Accessible Anywhere,{" "}
          <span className="relative inline-block highlight-anytime">
            Anytime.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          MediVault securely stores your medical records and vitals, helping you
          monitor, retrieve, and share health data with full privacy and control.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCTAClick}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-700 hover:bg-primary/90 transition shadow-md"
          >
            Get Started
          </button>

          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="border border-primary/30 text-primary px-8 py-4 rounded-lg font-700 hover:bg-primary/5 transition"
          >
            Explore Features
          </button>
        </div>
      </div>


{/* Glucose – Bottom Left */}
<div className="absolute bottom-24 left-10 z-20">
  <div
    className="animate-float-random relative"
    style={{ animationDuration: "18s" }}
  >
    {/* SMALL VITAL */}
    <div
      onMouseEnter={() => setHovered("glucose")}
      onMouseLeave={() => setHovered(null)}
      className="
        bg-white/90 backdrop-blur-md
        border border-primary/50
        rounded-md px-3 py-2
        transition-transform duration-200
        hover:scale-[1.05]
        will-change-transform
      "
    >
      <p className="text-[16px] font-500 text-muted-foreground">
        Glucose 95 mg/dL
      </p>
    </div>

    {/* TOOLTIP */}
    {hovered === "glucose" && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-fade-in">
        <div
          className="
            bg-primary text-white
            text-[11px] leading-relaxed
            px-3 py-2 rounded-md
            shadow-lg whitespace-nowrap
            max-w-xs
          "
        >
          <div className="font-600">Normal Glucose Levels</div>
          <div>• Fasting: 70–99 mg/dL</div>
          <div>• After meals: &lt;140 mg/dL</div>
        </div>
      </div>
    )}
  </div>
</div>

{/* Oxygen – Bottom Right */}
<div className="absolute bottom-24 right-10 z-20">
  <div
    className="animate-float-random relative"
    style={{ animationDuration: "20s" }}
  >
    {/* SMALL VITAL */}
    <div
      onMouseEnter={() => setHovered("oxygen")}
      onMouseLeave={() => setHovered(null)}
      className="
        bg-white/90 backdrop-blur-md
        border border-primary/50
        rounded-md px-3 py-2
        transition-transform duration-200
        hover:scale-[1.05]
        will-change-transform
      "
    >
      <p className="text-[16px] font-500 text-muted-foreground">
        Oxygen 98%
      </p>
    </div>

    {/* TOOLTIP */}
    {hovered === "oxygen" && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-fade-in">
        <div
          className="
            bg-primary text-white
            text-[11px] leading-relaxed
            px-3 py-2 rounded-md
            shadow-lg whitespace-nowrap
            max-w-xs
          "
        >
          <div className="font-600">Normal Oxygen Levels</div>
          <div>• Normal: 95–100%</div>
          <div>• Below 90% needs attention</div>
        </div>
      </div>
    )}
  </div>
</div>

    </section>
  )
}
