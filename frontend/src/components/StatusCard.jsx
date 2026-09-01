import { API_URL } from '../config';
import React from 'react'
import { CheckCircle2, XCircle, RefreshCw, Database, Server, Clock, AlertTriangle } from 'lucide-react'

export default function StatusCard({ status, loading, latency, error, responseData, onRetry }) {
  const isConnected = status === 'connected'

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFECE6]">
        <div className="flex items-center space-x-3">
          {/* Status Indicator Icon */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isConnected
                ? 'bg-[#E8EFEA] text-[#2D5A43]'
                : loading
                  ? 'bg-[#F2EFE9] text-[#7A8078]'
                  : 'bg-[#FDE8E8] text-[#C81E1E]'
              }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : loading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A8078]">
                System Link Status
              </span>
              <span className="inline-block w-2 h-2 rounded-full relative">
                <span
                  className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                />
                <span
                  className={`relative inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                />
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-[#1C1F1B] mt-0.5">
              {loading ? (
                'Connecting to backend...'
              ) : isConnected ? (
                <span className="text-[#2D5A43]">Backend connected ✅</span>
              ) : (
                <span className="text-[#C81E1E]">Backend not connected ❌</span>
              )}
            </h3>
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          disabled={loading}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full border border-[#DCD6CA] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#1C1F1B] text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[#5F655E] ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Testing...' : 'Check Connection'}</span>
        </button>
      </div>

      {/* Connection Details & Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFECE6]">
          <div className="flex items-center space-x-2 text-[#7A8078] text-xs font-medium uppercase tracking-wider mb-1">
            <Server className="w-3.5 h-3.5" />
            <span>Target Endpoint</span>
          </div>
          <div className="text-sm font-mono font-medium text-[#1C1F1B] truncate">
            GET http://localhost:8000/
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFECE6]">
          <div className="flex items-center space-x-2 text-[#7A8078] text-xs font-medium uppercase tracking-wider mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Database Setup</span>
          </div>
          <div className="text-sm font-medium text-[#1C1F1B]">
            SQLite (canteen.db) + SQLAlchemy
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFECE6]">
          <div className="flex items-center space-x-2 text-[#7A8078] text-xs font-medium uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Latency</span>
          </div>
          <div className="text-sm font-medium text-[#1C1F1B]">
            {latency ? `${latency} ms` : '—'}
          </div>
        </div>
      </div>

      {/* Response Payload Preview */}
      {responseData && (
        <div className="mt-6 p-4 rounded-xl bg-[#1C1F1B] text-[#E8EFEA] font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between text-[#8E978F] mb-2 text-[11px] uppercase tracking-wider border-b border-[#2C302B] pb-1">
            <span>Server JSON Response:</span>
            <span className="text-emerald-400">HTTP 200 OK</span>
          </div>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}

      {/* Error / Troubleshooting advice */}
      {error && !isConnected && (
        <div className="mt-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B]">
          <div className="flex items-center space-x-2 font-medium text-sm mb-1">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            <span>Unable to reach backend server</span>
          </div>
          <p className="text-xs text-[#7F1D1D] leading-relaxed">
            Ensure the FastAPI server is running with{' '}
            <code className="bg-[#FEE2E2] px-1.5 py-0.5 rounded font-mono text-[11px]">
              uvicorn app.main:app --reload --port 8000
            </code>{' '}
            inside the <code className="font-mono">backend</code> directory.
          </p>
        </div>
      )}
    </div>
  )
}
