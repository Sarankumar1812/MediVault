"use client"

import { useEffect, useRef, useState } from "react"

export default function About() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* SECTION TITLE */}
        <h2
          className={`
            text-5xl font-800 text-primary mb-12 text-center text-balance
            transition-all duration-700 ease-out
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
          `}
        >
          About MediVault
        </h2>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT – IMAGE */}
          <div
            className={`
              rounded-2xl overflow-hidden shadow-medical-lg
              transition-all duration-700 ease-out delay-150
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
            `}
          >
            <div className="aspect-square bg-muted">
              <img
                src="/assets/about.png"
                alt="About MediVault"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* RIGHT – CONTENT */}
          <div className="space-y-8">
            {/* VISION */}
            <div
              className={`
                transition-all duration-700 ease-out delay-200
                ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
              `}
            >
              <h3 className="text-3xl font-800 text-primary mb-4">
                Our Vision
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To empower individuals with complete ownership and control of
                their health information through a secure, accessible, and
                intuitive digital platform.
              </p>
            </div>

            {/* DESIGNED FOR */}
            <div
              className={`
                transition-all duration-700 ease-out delay-300
                ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
              `}
            >
              <h3 className="text-3xl font-800 text-primary mb-4">
                Designed For
              </h3>
              <ul className="grid grid-cols-2 gap-4">
                {["Patients", "Families", "Doctors", "Caregivers"].map(
                  (user, i) => (
                    <li
                      key={user}
                      className={`
                        flex items-center gap-3 text-lg font-600 text-foreground
                        transition-all duration-500
                        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                      `}
                      style={{ transitionDelay: `${350 + i * 80}ms` }}
                    >
                      <span className="w-3 h-3 bg-secondary rounded-full" />
                      {user}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* WHY MEDIVAULT */}
            <div
              className={`
                pt-8 border-t border-border
                transition-all duration-700 ease-out delay-500
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}
            >
              <h3 className="text-3xl font-800 text-primary mb-4">
                Why MediVault
              </h3>
              <ul className="space-y-3">
                {[
                  "Centralized health data management",
                  "Industry-grade security & encryption",
                  "User-controlled access & sharing",
                  "HIPAA-compliant infrastructure",
                ].map((point, i) => (
                  <li
                    key={point}
                    className={`
                      flex items-center gap-3 text-muted-foreground
                      transition-all duration-500
                      ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
                    `}
                    style={{ transitionDelay: `${550 + i * 80}ms` }}
                  >
                    <svg
                      className="w-5 h-5 text-secondary flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
