'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Zap, BarChart3, Trophy, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Diagonal court lines */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.03]">
          <svg viewBox="0 0 800 800" fill="none" className="w-full h-full">
            <line x1="0" y1="0" x2="800" y2="800" stroke="#005A9C" strokeWidth="2"/>
            <line x1="200" y1="0" x2="800" y2="600" stroke="#005A9C" strokeWidth="1"/>
            <line x1="400" y1="0" x2="800" y2="400" stroke="#005A9C" strokeWidth="1"/>
            <rect x="100" y="100" width="600" height="300" stroke="#005A9C" strokeWidth="1" fill="none"/>
          </svg>
        </div>
        {/* Gradient orb */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#005A9C]/10 via-[#0077CC]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-[#005A9C]/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-[#005A9C] rounded-xl flex items-center justify-center shadow-lg shadow-[#005A9C]/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Courtplanner
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Log ind
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#005A9C] rounded-xl hover:bg-[#004a80] transition-all shadow-lg shadow-[#005A9C]/20 hover:shadow-xl hover:shadow-[#005A9C]/30 hover:-translate-y-0.5"
              >
                Kom i gang
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#005A9C]/10 rounded-full text-sm font-medium text-[#005A9C] mb-6">
                <Sparkles className="w-4 h-4" />
                Gratis i beta
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6"
            >
              Smart træningsstyring
              <span className="block text-[#005A9C]">for badmintonklubber</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Automatisk holdsammensætning, spillerstatistik og Holdsport-integration.
              Alt hvad din klub behøver til effektive træninger.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#005A9C] rounded-2xl hover:bg-[#004a80] transition-all shadow-xl shadow-[#005A9C]/20 hover:shadow-2xl hover:shadow-[#005A9C]/30 hover:-translate-y-1"
              >
                Kom i gang gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                Log ind
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Hero visual - App Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-6xl mx-auto mt-16 px-4"
        >
          {/* Browser window frame */}
          <div className="bg-slate-800 rounded-t-2xl p-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-slate-700 rounded-lg px-4 py-1.5 text-sm text-slate-400 max-w-md mx-auto">
                courtplanner.dk/trainings/tirsdag-traening
              </div>
            </div>
          </div>

          {/* App content */}
          <div className="bg-[#f8fafc] rounded-b-2xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-200 border-t-0">
            {/* App header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#005A9C] rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-900">Tirsdag Træning</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">I gang</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>12 spillere</span>
                </div>
              </div>
            </div>

            {/* Training view mockup */}
            <div className="p-4 md:p-6">
              {/* Round header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">Runde 1</span>
                  <span className="text-xs text-slate-500">3 baner aktive</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Bænk:</span>
                  <div className="flex -space-x-1">
                    {['bg-blue-500', 'bg-emerald-500', 'bg-amber-500'].map((color, i) => (
                      <div key={i} className={`w-6 h-6 ${color} rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white`}>
                        {['MJ', 'KL', 'PH'][i]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Courts grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { court: 'Bane 2', team1: ['Anders Nielsen', 'Mette Hansen'], team2: ['Lars Petersen', 'Sofie Christensen'], score: null },
                  { court: 'Bane 3', team1: ['Thomas Larsen', 'Helle Madsen'], team2: ['Christian Sørensen', 'Anne Jensen'], score: '21-18' },
                  { court: 'Bane 4', team1: ['Martin Poulsen', 'Karen Andersen'], team2: ['Jens Olsen', 'Lise Møller'], score: null },
                ].map((match, index) => (
                  <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Court header */}
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">{match.court}</span>
                      {match.score && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                          {match.score}
                        </span>
                      )}
                    </div>

                    {/* Teams */}
                    <div className="p-4 space-y-3">
                      {/* Team 1 */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-blue-600 uppercase">Hold 1</div>
                        {match.team1.map((player, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                            <span className="text-sm font-medium text-slate-900">{player}</span>
                            <span className="text-xs text-slate-400">{1480 + Math.floor(Math.random() * 100)}</span>
                          </div>
                        ))}
                      </div>

                      {/* VS divider */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-300">VS</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      {/* Team 2 */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-red-600 uppercase">Hold 2</div>
                        {match.team2.map((player, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                            <span className="text-sm font-medium text-slate-900">{player}</span>
                            <span className="text-xs text-slate-400">{1480 + Math.floor(Math.random() * 100)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Result button */}
                      {!match.score ? (
                        <button className="w-full mt-2 bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg">
                          Resultat
                        </button>
                      ) : (
                        <div className="w-full mt-2 bg-green-50 text-green-700 text-sm font-semibold py-2.5 rounded-lg text-center">
                          ✓ Afsluttet
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Alt hvad din klub behøver
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Courtplanner gør træningsplanlægning nemt og effektivt
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                icon: Users,
                title: 'Automatisk holdsammensætning',
                description: 'ELO-baseret matchmaking sikrer jævnbyrdige og spændende kampe. Algoritmen tager højde for spillerniveau, makkerhistorik og pauser.',
                color: 'bg-blue-500',
              },
              {
                icon: Zap,
                title: 'Holdsport integration',
                description: 'Importer spillere og træninger direkte fra Holdsport med ét klik. Altid opdaterede tilmeldinger uden manuel indtastning.',
                color: 'bg-amber-500',
              },
              {
                icon: BarChart3,
                title: 'Spillerstatistik',
                description: 'Følg spillernes udvikling med detaljerede statistikker. Ranglister, win-rate, kamphistorik og ELO-udvikling over tid.',
                color: 'bg-emerald-500',
              },
              {
                icon: Trophy,
                title: 'Turneringsværktøj',
                description: 'Opret og administrer klubturneringer med automatisk bracket-generering og resultatregistrering.',
                color: 'bg-purple-500',
                badge: 'Kommer snart',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-slate-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.color} rounded-2xl mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  {feature.badge && (
                    <span className="shrink-0 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      {feature.badge}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Sådan virker det
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Kom i gang på under 5 minutter
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Opret klub',
                description: 'Opret din klub og importer spillere direkte fra Holdsport. Ingen manuel indtastning nødvendig.',
              },
              {
                step: '02',
                title: 'Start træning',
                description: 'Vælg antal baner og lad Courtplanner sammensætte optimale hold baseret på spillerniveau.',
              },
              {
                step: '03',
                title: 'Følg udviklingen',
                description: 'Registrer resultater og følg spillernes ELO-udvikling, statistik og præstationer over tid.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-8xl font-black text-[#005A9C]/5 absolute -top-6 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <div className="w-12 h-12 bg-[#005A9C] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#005A9C]/20">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-[#005A9C] to-[#003d6b] rounded-3xl p-8 md:p-16 text-center overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 border border-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 border border-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Klar til at prøve Courtplanner?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Opret din klub gratis og oplev hvordan smart træningsstyring kan transformere jeres badmintontræning.
              </p>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#005A9C] bg-white rounded-2xl hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Opret gratis konto
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#005A9C] rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Courtplanner</span>
              <span className="text-sm text-slate-500">• Gratis i beta</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
                Log ind
              </Link>
              <Link href="/register" className="text-slate-600 hover:text-slate-900 transition-colors">
                Opret konto
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Courtplanner. Lavet med ❤️ til danske badmintonklubber.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
