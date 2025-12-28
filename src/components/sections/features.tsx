"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { TrendingUp, Smartphone, Search, Lock, Wifi } from "lucide-react"

const features = [
  {
    id: "vitals",
    icon: TrendingUp,
    title: "Vitals Timeline",
    description:
      "Track vitals such as blood pressure, heart rate, and glucose levels over time using clear visual timelines that help identify trends early.",
    image: "/assets/vitals.png",
  },
  {
    id: "upload",
    icon: Smartphone,
    title: "Report Upload",
    description:
      "Upload medical reports seamlessly via web, mobile devices, or WhatsApp for maximum convenience.",
    image: "/assets/mobilereport.png",
  },
  {
    id: "retrieval",
    icon: Search,
    title: "Smart Retrieval",
    description:
      "Retrieve medical records quickly using filters like date range, report type, and vital category.",
    image: "/assets/datasearch.png",
  },
  {
    id: "access",
    icon: Lock,
    title: "Access Control",
    description:
      "Grant and revoke access to doctors, family members, or caregivers with report-level permissions.",
    image: "/assets/secureaccess.png",
  },
  {
    id: "anywhere",
    icon: Wifi,
    title: "Anywhere Access",
    description:
      "Securely access your health wallet from any device with enterprise-grade encryption.",
    image: "/assets/securinghealthcare.png",
  },
]

export default function Features() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [progressHeight, setProgressHeight] = useState(0)

  /* ------------------------------
     Observe active timeline item
  ------------------------------ */
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    itemRefs.current.forEach((el, index) => {
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index)
          }
        },
        { threshold: 0.5 }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  /* ------------------------------
     Update progress bar height
  ------------------------------ */
  useEffect(() => {
    if (!containerRef.current || !itemRefs.current[activeIndex]) return

    const containerTop =
      containerRef.current.getBoundingClientRect().top
    const activeTop =
      itemRefs.current[activeIndex]!.getBoundingClientRect().top

    setProgressHeight(activeTop - containerTop + 28)
  }, [activeIndex])

  return (
    <section
      id="features"
      className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white"
    >
      {/* TITLE */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-5xl font-800 text-primary text-center">
          Powerful Features
        </h2>
      </div>

      {/* TIMELINE WRAPPER */}
      <div
        ref={containerRef}
        className="relative max-w-6xl mx-auto pl-20"
      >
        {/* VERTICAL LINE */}
        <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-border">
          <div
            className="absolute top-0 left-0 w-[2px] bg-secondary transition-all duration-500"
            style={{ height: progressHeight }}
          />
        </div>

        {/* FEATURE ITEMS */}
        <div className="space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isEven = index % 2 === 0
            const isActive = index <= activeIndex

            return (
              <div
                key={feature.id}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                className="relative grid md:grid-cols-2 gap-10 items-center"
              >
                {/* NODE (ON THE LINE) */}
                <div className="absolute left-8 top-8 -translate-x-1/2">
                  <div
                    className={`
                      w-4 h-4 rounded-full border-4
                      transition-all duration-300
                      ${
                        isActive
                          ? "bg-secondary border-secondary scale-110"
                          : "bg-white border-border"
                      }
                    `}
                  />
                </div>

                {/* TEXT */}
                <div className={`${isEven ? "" : "md:order-2"}`}>
                  <Icon className="w-16 h-16 text-secondary mb-6" />
                  <h3 className="text-4xl font-800 text-primary mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* IMAGE */}
                <div className={`${isEven ? "" : "md:order-1"}`}>
                  <div className="relative rounded-2xl p-2 bg-muted shadow-medical group hover:shadow-medical-lg transition">
                    <div className="relative h-72 w-full rounded-xl overflow-hidden bg-white">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-contain transition-transform duration-700 group-hover:scale-105"
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
