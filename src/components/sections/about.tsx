export default function About() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-800 text-primary mb-16 text-center text-balance">About MediVault</h2>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left side - Image/Visual */}
          <div className="rounded-2xl overflow-hidden shadow-medical-lg transform transition-all hover:shadow-2xl duration-300">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 aspect-square flex items-center justify-center">
              <div className="w-full h-full bg-[url('/healthcare-illustration.jpg')] bg-cover bg-center opacity-90" />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            <div className="transform transition-all hover:translate-x-2 duration-300">
              <h3 className="text-3xl font-800 text-primary mb-4">Our Vision</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To empower individuals with complete ownership and control of their health information through a secure,
                accessible, and intuitive digital platform that transforms how healthcare data is managed.
              </p>
            </div>

            <div className="transform transition-all hover:translate-x-2 duration-300">
              <h3 className="text-3xl font-800 text-primary mb-4">Designed For</h3>
              <ul className="grid grid-cols-2 gap-4">
                {["Patients", "Families", "Doctors", "Caregivers"].map((user) => (
                  <li key={user} className="flex items-center gap-3 text-lg font-600 text-foreground">
                    <span className="w-3 h-3 bg-secondary rounded-full"></span>
                    {user}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="text-3xl font-800 text-primary mb-4">Why MediVault</h3>
              <ul className="space-y-3">
                {[
                  "Centralized health data management",
                  "Industry-grade security & encryption",
                  "User-controlled access & sharing",
                  "HIPAA-compliant infrastructure",
                ].map((point) => (
                  <li key={point} className="flex items-center gap-3 text-muted-foreground">
                    <svg className="w-5 h-5 text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
