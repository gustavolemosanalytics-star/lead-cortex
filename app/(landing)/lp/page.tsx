'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Brain,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { Hyperspeed } from '@/components/backgrounds/hyperspeed'
import { GlitchText } from '@/components/animations/glitch-text'
import { GradientText } from '@/components/animations/gradient-text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const leadSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  company: z.string().min(2, 'Empresa é obrigatória'),
})

type LeadForm = z.infer<typeof leadSchema>

interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbc?: string
  fbp?: string
  gclid?: string
}

const features = [
  {
    icon: BarChart3,
    title: 'Analytics em Tempo Real',
    description: 'Acompanhe seus leads e campanhas em tempo real',
  },
  {
    icon: Brain,
    title: 'IA Preditiva',
    description: 'Previsões inteligentes para suas conversões',
  },
  {
    icon: Target,
    title: 'Atribuição Multitouch',
    description: 'Saiba exatamente de onde vêm seus leads',
  },
  {
    icon: TrendingUp,
    title: 'ROI Otimizado',
    description: 'Maximize o retorno das suas campanhas',
  },
]

export default function LandingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [utmParams, setUtmParams] = useState<UTMParams>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  })

  // Capture UTM parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const captured: UTMParams = {}

    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbc', 'fbp', 'gclid']
    utmKeys.forEach((key) => {
      const value = params.get(key)
      if (value) {
        captured[key as keyof UTMParams] = value
      }
    })

    // Try to get fbp from cookie
    const fbpCookie = document.cookie.split(';').find((c) => c.trim().startsWith('_fbp='))
    if (fbpCookie) {
      captured.fbp = fbpCookie.split('=')[1]
    }

    // Try to get fbc from cookie
    const fbcCookie = document.cookie.split(';').find((c) => c.trim().startsWith('_fbc='))
    if (fbcCookie) {
      captured.fbc = fbcCookie.split('=')[1]
    }

    setUtmParams(captured)
  }, [])

  const onSubmit = async (data: LeadForm) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/webhook/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...utmParams,
          landing_page: window.location.pathname,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
      }
    } catch (error) {
      console.error('Error submitting lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Hyperspeed />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent-purple)] shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <GradientText>Cortex</GradientText>
            </span>
          </div>
          <Button variant="outline" size="sm">
            Login
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Plataforma líder em Analytics para Lead Gen
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <GlitchText text="Transforme dados" className="block" />
                <span className="text-[var(--foreground-muted)]">em </span>
                <GradientText className="text-4xl md:text-5xl lg:text-6xl">conversões</GradientText>
              </h1>

              <p className="text-lg text-[var(--foreground-muted)] mb-8 max-w-lg">
                Conecte suas campanhas de Meta, Google e TikTok em um único dashboard
                com insights preditivos baseados em IA.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent-cyan)] flex items-center justify-center text-white text-sm font-bold border-2 border-[var(--background)]"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-medium">+500 empresas</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    já usam Cortex Analytics
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent-cyan)] to-[var(--accent-pink)]" />

                <AnimatePresence mode="wait">
                  {!isSuccess ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2 className="text-2xl font-bold mb-2">
                        Agende uma demonstração
                      </h2>
                      <p className="text-[var(--foreground-muted)] mb-6">
                        Descubra como aumentar suas conversões em até 40%
                      </p>

                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                          <Input
                            placeholder="Seu nome"
                            {...register('name')}
                            className={errors.name ? 'border-[var(--error)]' : ''}
                          />
                          {errors.name && (
                            <p className="text-xs text-[var(--error)] mt-1">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Input
                            type="email"
                            placeholder="Seu email corporativo"
                            {...register('email')}
                            className={errors.email ? 'border-[var(--error)]' : ''}
                          />
                          {errors.email && (
                            <p className="text-xs text-[var(--error)] mt-1">
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Input
                            type="tel"
                            placeholder="Telefone com DDD"
                            {...register('phone')}
                            className={errors.phone ? 'border-[var(--error)]' : ''}
                          />
                          {errors.phone && (
                            <p className="text-xs text-[var(--error)] mt-1">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Input
                            placeholder="Nome da empresa"
                            {...register('company')}
                            className={errors.company ? 'border-[var(--error)]' : ''}
                          />
                          {errors.company && (
                            <p className="text-xs text-[var(--error)] mt-1">
                              {errors.company.message}
                            </p>
                          )}
                        </div>

                        {/* Hidden UTM fields */}
                        <input type="hidden" name="utm_source" value={utmParams.utm_source || ''} />
                        <input type="hidden" name="utm_medium" value={utmParams.utm_medium || ''} />
                        <input type="hidden" name="utm_campaign" value={utmParams.utm_campaign || ''} />
                        <input type="hidden" name="fbc" value={utmParams.fbc || ''} />
                        <input type="hidden" name="fbp" value={utmParams.fbp || ''} />
                        <input type="hidden" name="gclid" value={utmParams.gclid || ''} />

                        <Button
                          type="submit"
                          variant="gradient"
                          size="lg"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            'Enviando...'
                          ) : (
                            <>
                              Quero uma demonstração
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-[var(--foreground-muted)]">
                          Ao enviar, você concorda com nossa{' '}
                          <a href="#" className="text-[var(--primary)] hover:underline">
                            política de privacidade
                          </a>
                        </p>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="w-20 h-20 rounded-full bg-[var(--success)]/20 flex items-center justify-center mx-auto mb-6"
                      >
                        <CheckCircle2 className="h-10 w-10 text-[var(--success)]" />
                      </motion.div>
                      <h2 className="text-2xl font-bold mb-2">Recebemos seu contato!</h2>
                      <p className="text-[var(--foreground-muted)] mb-6">
                        Nossa equipe entrará em contato em até 24 horas úteis.
                      </p>
                      <Button variant="outline" onClick={() => setIsSuccess(false)}>
                        Enviar outro contato
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--glass-border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--foreground-muted)]">
            © 2024 Cortex Analytics. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
            <a href="#" className="hover:text-[var(--foreground)]">
              Termos de uso
            </a>
            <a href="#" className="hover:text-[var(--foreground)]">
              Privacidade
            </a>
            <a href="#" className="hover:text-[var(--foreground)]">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
