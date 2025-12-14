'use client'

import { motion } from 'framer-motion'
import {
  Settings,
  Webhook,
  Database,
  Key,
  Bell,
  Shield,
  Download,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { SpotlightCard } from '@/components/animations/spotlight-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const webhookUrl = 'https://demo.cortexanalytics.com.br/api/webhook/lead'
  const apiKey = 'ctx_live_sk_xxxxxxxxxxxxxxxxxxxxx'

  return (
    <div className="min-h-screen">
      <Header title="Configurações" subtitle="Gerenciar integrações e preferências" />

      <div className="p-6 space-y-6">
        {/* Integrations Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SpotlightCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[var(--primary)]" />
                Status das Integrações
              </CardTitle>
              <CardDescription>
                Conexões ativas com suas fontes de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Banco de Dados</span>
                    <Badge variant="success">Conectado</Badge>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    MySQL - Railway
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    Última sincronização: agora
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Meta Ads</span>
                    <Badge variant="success">Ativo</Badge>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    3 campanhas ativas
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    Última atualização: 5 min
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Google Ads</span>
                    <Badge variant="success">Ativo</Badge>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    3 campanhas ativas
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    Última atualização: 5 min
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">TikTok Ads</span>
                    <Badge variant="success">Ativo</Badge>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    1 campanha ativa
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    Última atualização: 10 min
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">CRM</span>
                    <Badge variant="warning">Não configurado</Badge>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Nenhuma integração
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Configurar
                  </Button>
                </div>

                <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Webhook</span>
                    <Badge variant="success">Ativo</Badge>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Recebendo leads
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    600 leads recebidos
                  </p>
                </div>
              </div>
            </CardContent>
          </SpotlightCard>
        </motion.div>

        {/* Webhook Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SpotlightCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-[var(--primary)]" />
                Configuração do Webhook
              </CardTitle>
              <CardDescription>
                URL para receber leads das suas landing pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Endpoint URL</label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(webhookUrl, 'webhook')}
                  >
                    {copied === 'webhook' ? (
                      <Check className="h-4 w-4 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--background-secondary)]">
                <h4 className="font-medium mb-2">Campos aceitos:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <code className="p-1 rounded bg-[var(--glass-bg)]">name</code>
                  <code className="p-1 rounded bg-[var(--glass-bg)]">email</code>
                  <code className="p-1 rounded bg-[var(--glass-bg)]">phone</code>
                  <code className="p-1 rounded bg-[var(--glass-bg)]">company</code>
                  <code className="p-1 rounded bg-[var(--glass-bg)]">utm_source</code>
                  <code className="p-1 rounded bg-[var(--glass-bg)]">utm_medium</code>
                  <code className="p-1 rounded bg-[var(--glass-bg)]">utm_campaign</code>
                  <code className="p-1 rounded bg-[var(--glass-bg)]">fbc/fbp</code>
                </div>
              </div>
            </CardContent>
          </SpotlightCard>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SpotlightCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[var(--primary)]" />
                Chaves de API
              </CardTitle>
              <CardDescription>
                Credenciais para integração via API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">API Key (Live)</label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={apiKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(apiKey, 'api')}
                  >
                    {copied === 'api' ? (
                      <Check className="h-4 w-4 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Gerar nova chave</Button>
                <Button variant="ghost">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver documentação
                </Button>
              </div>
            </CardContent>
          </SpotlightCard>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SpotlightCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[var(--primary)]" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure alertas e notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--glass-border)]">
                  <div>
                    <p className="font-medium">Novos leads</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Receber notificação quando um novo lead entrar
                    </p>
                  </div>
                  <Badge variant="success">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--glass-border)]">
                  <div>
                    <p className="font-medium">Leads de alta probabilidade</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Alertar quando leads com score > 80 entrarem
                    </p>
                  </div>
                  <Badge variant="success">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--glass-border)]">
                  <div>
                    <p className="font-medium">Relatório diário</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Resumo diário por email às 9h
                    </p>
                  </div>
                  <Badge variant="default">Desativado</Badge>
                </div>
              </div>
            </CardContent>
          </SpotlightCard>
        </motion.div>

        {/* Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SpotlightCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-[var(--primary)]" />
                Exportar Dados
              </CardTitle>
              <CardDescription>
                Baixe relatórios e exporte seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <Download className="h-5 w-5 mb-2" />
                  <span className="font-medium">Leads (CSV)</span>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    Exportar todos os leads
                  </span>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <Download className="h-5 w-5 mb-2" />
                  <span className="font-medium">Relatório (PDF)</span>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    Relatório mensal completo
                  </span>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <Download className="h-5 w-5 mb-2" />
                  <span className="font-medium">Campanhas (XLSX)</span>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    Performance de campanhas
                  </span>
                </Button>
              </div>
            </CardContent>
          </SpotlightCard>
        </motion.div>

        {/* LGPD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SpotlightCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[var(--primary)]" />
                Privacidade e LGPD
              </CardTitle>
              <CardDescription>
                Configurações de proteção de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-[var(--success)]/50 bg-[var(--success)]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-[var(--success)]" />
                    <span className="font-medium text-[var(--success)]">Conformidade LGPD Ativa</span>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Todos os dados sensíveis (email, telefone) são armazenados de forma
                    criptografada usando hash SHA-256.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border border-[var(--glass-border)]">
                    <p className="font-medium mb-1">Retenção de dados</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      24 meses (padrão LGPD)
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-[var(--glass-border)]">
                    <p className="font-medium mb-1">Anonimização</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      PII hash ativo
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </SpotlightCard>
        </motion.div>
      </div>
    </div>
  )
}
