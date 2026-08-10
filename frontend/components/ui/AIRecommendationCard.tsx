import React from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface AIRecommendationCardProps {
  agentName: string
  confidence: number
  recommendation: string
  actions: string[]
  onApprove?: () => void
  onReject?: () => void
  timestamp?: string
  status?: 'pending' | 'approved' | 'rejected'
}

export default function AIRecommendationCard({
  agentName,
  confidence,
  recommendation,
  actions,
  onApprove,
  onReject,
  timestamp,
  status = 'pending'
}: AIRecommendationCardProps) {
  const isPending = status === 'pending'
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

  return (
    <div className="glass-panel border-l-4 border-l-blue-500 rounded-2xl p-5 flex flex-col space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{agentName} Node</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-500 font-mono-data">{timestamp || 'Just now'}</span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-900/30 rounded font-mono-data">
            {confidence}% Confidence
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-sm font-semibold text-white leading-relaxed">
          {recommendation}
        </h5>
        
        {actions.length > 0 && (
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 pt-1">
            {actions.map((act, index) => (
              <li key={index} className="leading-relaxed">
                {act}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isPending && (onApprove || onReject) && (
        <div className="flex items-center space-x-2 pt-2">
          {onApprove && (
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center space-x-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Approve Action</span>
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
            >
              Reject
            </button>
          )}
        </div>
      )}

      {isApproved && (
        <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/30 px-3 py-2 flex items-center space-x-2 text-xs text-emerald-400 font-medium">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Action Plan Dispatch Approved</span>
        </div>
      )}

      {isRejected && (
        <div className="rounded-lg bg-red-950/20 border border-red-900/30 px-3 py-2 flex items-center space-x-2 text-xs text-red-400 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Action Plan Dismissed</span>
        </div>
      )}
    </div>
  )
}
