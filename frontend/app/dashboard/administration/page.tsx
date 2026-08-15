'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import { apiService, IngestionStatusResponse } from '../../../services/api'
import { Database, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react'

export default function AdministrationPage() {
  const [status, setStatus] = useState<IngestionStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const res = await apiService.getIngestionStatus()
      setStatus(res)
      setError(null)
    } catch (err: any) {
      console.error(err)
      if (err.status === 403) {
        setError("ACCESS DENIED: Administrative privilege required.")
      } else {
        setError(err.message || "Failed to fetch ingestion sync status.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleSyncNow = async () => {
    setSyncing(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await apiService.triggerIngestionSync()
      setStatus(res)
      setSuccessMsg("Public dataset synchronization completed successfully.")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Ingestion sync trigger failed.")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-5 text-slate-200">
        <PageHeader
          title="Administrative Data Ingestion Console"
          description="Manage public API synchronization pipelines, ingest OpenStreetMap geometries, and trigger weather/AQI telemetry updates."
          breadcrumbs={[{ label: 'Home' }, { label: 'Administration' }]}
        />

        {error && (
          <div className="p-4 rounded-xl border border-red-900 bg-red-950/20 text-red-400 font-mono text-xs flex items-center space-x-2.5">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-900 bg-emerald-950/20 text-emerald-400 font-mono text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Controls Panel */}
          <div className="lg:col-span-1 glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-900">
                <Database className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">Sync Controller</h3>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pipeline State:</span>
                  <span className={`font-bold uppercase ${
                    status?.status === 'success' ? 'text-emerald-400' :
                    status?.status === 'running' ? 'text-purple-400 animate-pulse' :
                    'text-amber-500'
                  }`}>
                    {status?.status || 'unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration (ms):</span>
                  <span className="text-slate-300 font-bold">{status?.duration_ms || 0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Synced:</span>
                  <span className="text-slate-300 font-bold truncate max-w-[150px]">
                    {status?.last_run ? new Date(status.last_run).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={syncing || loading}
              className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-550 disabled:border-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-sky-900/10 border border-sky-400/20 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing Datasets...' : 'Sync Now'}</span>
            </button>
          </div>

          {/* Sources Summary list */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-900">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">Ingested Data Sources</h3>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 animate-pulse">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-xs text-slate-500 font-mono">Querying ingestion pipeline...</span>
              </div>
            ) : !status?.sources || Object.keys(status.sources).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-550 italic font-mono">
                No active dataset ingestion history found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(status.sources).map(([name, data]: [string, any]) => (
                  <div key={name} className="p-4 rounded-xl border border-slate-850 bg-[#050816] space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="font-extrabold text-xs text-white uppercase font-mono">{name}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase border ${
                        data.status === 'success' ? 'bg-emerald-950/60 border-emerald-900 text-emerald-400' :
                        data.status === 'partial_success' ? 'bg-amber-950/60 border-amber-900 text-amber-400' :
                        'bg-red-950/60 border-red-900 text-red-400'
                      }`}>
                        {data.status || 'unknown'}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Processed:</span>
                        <span className="text-slate-350">{data.records_processed ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Created:</span>
                        <span className="text-slate-350 text-emerald-400 font-bold">+{data.records_created ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Updated:</span>
                        <span className="text-slate-350 text-sky-400 font-bold">~{data.records_updated ?? 0}</span>
                      </div>
                    </div>

                    {data.errors && data.errors.length > 0 && (
                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide flex items-center space-x-1 mb-1 font-mono">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Pipeline Errors ({data.errors.length})</span>
                        </span>
                        <div className="max-h-[60px] overflow-y-auto space-y-1 text-[9px] text-slate-450 font-mono bg-red-950/10 p-1.5 rounded border border-red-950/30">
                          {data.errors.map((e: string, idx: number) => (
                            <p key={idx} className="break-all">{e}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
