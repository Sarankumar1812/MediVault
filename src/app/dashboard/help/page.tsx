"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Mail, MessageCircle } from "lucide-react"

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I upload medical reports?",
      answer:
        "Go to the Reports section and click 'Upload Report'. Select the report type, add a name, and upload your PDF or image file.",
    },
    {
      question: "Can I share my reports with my doctor?",
      answer:
        "Yes! Go to Shared Reports and click 'Share Report'. Enter your doctor's email and select their role. They'll get read-only access.",
    },
    {
      question: "How is my data secured?",
      answer:
        "All your data is encrypted in transit and at rest. We follow HIPAA and GDPR compliance standards to protect your privacy.",
    },
    {
      question: "How do I track my vitals?",
      answer:
        "Navigate to the Vitals section and click 'Add Vital'. Enter your measurements, and they'll be saved to your history and displayed in charts.",
    },
    {
      question: "What should I do if I forget my password?",
      answer:
        "Click 'Forgot Password' on the login page. We'll send you a reset link via email to recover your account.",
    },
    {
      question: "Can I export my health data?",
      answer:
        "Yes, you can download individual reports from the Reports section. A bulk export feature is coming soon.",
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-2">Get answers to common questions</p>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="pt-6 text-center space-y-4">
            <Mail className="w-12 h-12 text-primary mx-auto" />
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@medivault.com</p>
            </div>
            <Button variant="outline">Send Email</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="pt-6 text-center space-y-4">
            <MessageCircle className="w-12 h-12 text-primary mx-auto" />
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our team</p>
            </div>
            <Button variant="outline">Start Chat</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <HelpCircle className="w-6 h-6" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Documentation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Documentation</CardTitle>
          <CardDescription className="text-blue-800">Learn more about MediVault</CardDescription>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3">
          <p>
            <Button variant="link" className="p-0">
              Getting Started Guide
            </Button>
          </p>
          <p>
            <Button variant="link" className="p-0">
              Privacy Policy
            </Button>
          </p>
          <p>
            <Button variant="link" className="p-0">
              Terms of Service
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
