"use client"

import { Lock, BarChart3, Upload, Share2, Globe, FileText } from "lucide-react"

const capabilities = [
  {
    icon: FileText,
    title: "Centralized Storage",
    description: "Digital storage for all medical records",
  },
  {
    icon: BarChart3,
    title: "Visual Tracking",
    description: "Health vitals tracked over time",
  },
  {
    icon: Upload,
    title: "Multi-Channel Upload",
    description: "Reports via web, mobile, and WhatsApp",
  },
  {
    icon: Globe,
    title: "Smart Retrieval",
    description: "Intelligent filtering and search",
  },
  {
    icon: Share2,
    title: "Access Control",
    description: "Permission-based secure sharing",
  },
  {
    icon: Lock,
    title: "Anywhere Access",
    description: "Secure access from any device",
  },
]

export default function Capabilities() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-800 text-primary mb-16 text-center text-balance">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-medical h-64 flex flex-col justify-between border border-border/50 transition-all duration-300 hover:shadow-medical-lg"
              >
                <div>
                  <Icon className="w-14 h-14 text-secondary mb-4 transition-colors duration-300" strokeWidth={1.5} />
                  <h3 className="text-2xl font-700 text-primary mb-3">{capability.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{capability.description}</p>
                </div>
                <div className="h-1 bg-gradient-to-r from-secondary to-secondary-teal rounded-full mt-4 transition-all duration-300" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
