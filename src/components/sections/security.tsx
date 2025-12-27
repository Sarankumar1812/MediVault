"use client"

import { Lock, User, Shield, FileText } from "lucide-react"

const securityPoints = [
  {
    icon: User,
    title: "Data Ownership",
    description: "Users retain full ownership of their medical data at all times.",
  },
  {
    icon: Lock,
    title: "Permission Management",
    description: "Access is strictly controlled by the user and can be modified or revoked at any point.",
  },
  {
    icon: Shield,
    title: "Authentication",
    description: "Sensitive actions require OTP-based verification for maximum security.",
  },
  {
    icon: FileText,
    title: "Privacy by Design",
    description:
      "Explicit consent is required for registration and data sharing. Privacy is foundational, not optional.",
  },
]

export default function Security() {
  return (
    <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-800 text-primary mb-4 text-center text-balance">Security & Privacy</h2>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Your health data is your most sensitive information. We take security and privacy seriously.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {securityPoints.map((point, index) => {
            const Icon = point.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-medical border border-border/50 group transition-all duration-300 hover:shadow-medical-lg"
              >
                <Icon
                  className="w-14 h-14 text-primary mb-4 transition-colors duration-300 group-hover:text-secondary"
                  strokeWidth={1.5}
                />
                <h3 className="text-2xl font-700 text-primary mb-3 transition-colors duration-300 group-hover:text-secondary">
                  {point.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{point.description}</p>
                <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-6 transition-all duration-300 w-0 group-hover:w-full" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
