"use client"

interface FinalCTAProps {
  onCTAClick: () => void
}

export default function FinalCTA({ onCTAClick }: FinalCTAProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-16 md:p-20 text-center shadow-medical-lg transform transition-all hover:shadow-2xl hover:scale-105 duration-300">
          <h2 className="text-5xl md:text-6xl font-800 text-white mb-8 text-balance leading-tight">
            Take Control of Your Health Data with Confidence
          </h2>
          <button
            onClick={onCTAClick}
            className="bg-white text-primary px-10 py-4 rounded-lg font-800 text-lg hover:bg-white/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary transform hover:scale-110"
          >
            Create Your Health Wallet
          </button>
        </div>
      </div>
    </section>
  )
}
