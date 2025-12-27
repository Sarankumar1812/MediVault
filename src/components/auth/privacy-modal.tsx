"use client"

import { X } from "lucide-react"

interface PrivacyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  if (!open) return null

  const privacySections = [
    {
      title: "Introduction",
      content:
        "MediVault is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our digital health wallet platform.",
    },
    {
      title: "Information Collected",
      content:
        "We collect information you provide directly such as name, contact details, date of birth, and medical records. We also collect usage data and technical information to improve our services.",
    },
    {
      title: "Data Usage",
      content:
        "Your data is used to provide, maintain, and improve our services. We never use your health information for marketing or selling to third parties without explicit consent.",
    },
    {
      title: "Medical Data Handling",
      content:
        "All medical records and health data are stored with end-to-end encryption. You maintain complete ownership and control over your medical information at all times.",
    },
    {
      title: "Data Sharing",
      content:
        "You control who can access your health data. You can grant and revoke access to doctors, family members, and caregivers at any time. Sharing is always permission-based.",
    },
    {
      title: "Security Measures",
      content:
        "We employ industry-grade encryption, secure authentication, and regular security audits to protect your data from unauthorized access.",
    },
    {
      title: "Data Retention",
      content:
        "Your data is retained as long as your account is active. You can request deletion of your account and associated data at any time.",
    },
    {
      title: "User Rights",
      content:
        "You have the right to access, modify, and delete your personal information. You can also export your data in standard formats.",
    },
    {
      title: "Consent & Withdrawal",
      content:
        "Your explicit consent is required for all data processing. You can withdraw consent and request data deletion at any time without penalty.",
    },
    {
      title: "Policy Updates",
      content:
        "We may update this Privacy Policy periodically. Changes will be notified to you, and continued use of the service constitutes acceptance of updates.",
    },
    {
      title: "Contact Information",
      content:
        "For privacy inquiries or concerns, please contact our Privacy Officer at privacy@medivault.com or visit our contact page.",
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-border">
            <h2 id="privacy-modal-title" className="text-2xl font-700 text-primary">
              Privacy Policy
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-8 space-y-8">
            {privacySections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-600 text-primary mb-2">
                  {index + 1}. {section.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-8 bg-muted">
            <p className="text-sm text-muted-foreground mb-4">
              By creating an account, you acknowledge that you have read and agree to this Privacy Policy.
            </p>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-600 hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
