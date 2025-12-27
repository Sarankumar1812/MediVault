"use client"

import { TrendingUp, Smartphone, Search, Lock, Wifi } from "lucide-react"

const features = [
  {
    id: "vitals",
    icon: TrendingUp,
    title: "Vitals Timeline",
    description:
      "Track vitals such as blood pressure, heart rate, and glucose levels across time using clear visual timelines that help identify trends and changes early.",
  },
  {
    id: "upload",
    icon: Smartphone,
    title: "Report Upload",
    description:
      "Upload medical reports through web interface, mobile devices, and WhatsApp-based submission for maximum convenience.",
  },
  {
    id: "retrieval",
    icon: Search,
    title: "Smart Retrieval",
    description:
      "Retrieve reports efficiently using filters such as date range, vital type, and report category for fast access.",
  },
  {
    id: "access",
    icon: Lock,
    title: "Access Control",
    description:
      "Grant and revoke access to doctors, family members, and caregivers with support for report-specific and time-bound permissions.",
  },
  {
    id: "anywhere",
    icon: Wifi,
    title: "Anywhere Access",
    description:
      "Securely access your health wallet from any device, anytime, with industry-grade encryption and security.",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-800 text-primary mb-16 text-center text-balance">Powerful Features</h2>
        <div className="space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isEven = index % 2 === 0
            return (
              <div key={feature.id} className="group">
                <div className={`grid md:grid-cols-2 gap-16 items-center ${isEven ? "" : "md:grid-flow-dense"}`}>
                  <div className={`${isEven ? "order-1" : "order-2"} transition-all duration-300`}>
                    <Icon
                      className="w-20 h-20 text-secondary mb-6 transition-colors duration-300 group-hover:text-secondary-teal"
                      strokeWidth={1.5}
                    />
                    <h3 className="text-4xl font-800 text-primary mb-6">{feature.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                  <div
                    className={`rounded-2xl p-8 bg-muted shadow-medical transition-shadow duration-300 group-hover:shadow-medical-lg ${isEven ? "order-2" : "order-1"}`}
                  >
                    <div className="h-72 bg-white rounded-lg flex items-center justify-center overflow-hidden relative">
                      <Icon
                        className="w-32 h-32 text-muted-foreground/20 transition-colors duration-300"
                        strokeWidth={0.5}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
