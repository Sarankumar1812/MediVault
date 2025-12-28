"use client"

import { Lock, BarChart3, Upload, Share2, Globe, FileText } from "lucide-react"

const capabilities = [
  {
    icon: FileText,
    title: "Centralized Health Records",
    points: [
      "All medical reports in one secure digital vault",
      "Prescriptions, lab results, and history in one place",
    ],
  },
  {
    icon: BarChart3,
    title: "Vitals & Trend Tracking",
    points: [
      "Track glucose, BP, oxygen, and more",
      "Understand health trends visually",
    ],
  },
  {
    icon: Upload,
    title: "Multi-Channel Uploads",
    points: [
      "Upload reports via web, mobile, or WhatsApp",
      "No dependency on a single device",
    ],
  },
  {
    icon: Globe,
    title: "Smart Search & Retrieval",
    points: [
      "Find records by date, type, or vitals",
      "Instant access to critical information",
    ],
  },
  {
    icon: Share2,
    title: "Controlled Data Sharing",
    points: [
      "Share securely with doctors or family",
      "Time-bound access permissions",
    ],
  },
  {
    icon: Lock,
    title: "Secure Anywhere Access",
    points: [
      "Enterprise-grade encryption",
      "Access health data from any device",
    ],
  },
]

export default function Capabilities() {
  return (
    <section className="pb-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-5xl font-800 text-primary text-center text-balance">
          Core Capabilities
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {capabilities.map((capability, index) => {
          const Icon = capability.icon
          const isOdd = index % 2 === 0 // 1,3,5 visually

          return (
            <div key={index} className="relative h-[266px] perspective">
              <div className="flip-container w-full h-full">

                {/* FRONT SIDE */}
                <div
                  className={`
                    flip-front rounded-2xl
                    border border-border/50 shadow-medical
                    flex flex-col items-center justify-center
                    px-8 py-10 space-y-3
                    ${isOdd ? "bg-secondary text-white" : "bg-white text-primary"}
                  `}
                >
                  <Icon
                    className={`w-16 h-16 ${isOdd ? "text-white" : "text-secondary"}`}
                    strokeWidth={1.5}
                  />
                  <h3 className="text-2xl font-800 text-center">
                    {capability.title}
                  </h3>
                </div>

                {/* BACK SIDE */}
                <div
                  className={`
                    flip-back rounded-2xl
                    px-8 py-10
                    flex flex-col justify-center space-y-4
                    shadow-medical-lg
                    ${isOdd ? "bg-white text-foreground" : "bg-secondary text-white"}
                  `}
                >
                  <h3 className="text-xl font-700">
                    {capability.title}
                  </h3>

                  <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed">
                    {capability.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
