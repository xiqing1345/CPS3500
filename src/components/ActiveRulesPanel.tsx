'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, FileText, RefreshCw } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  'Cleaning Schedule': 'bg-green-100 text-green-700 border-green-200',
  'Visitor Policy':    'bg-blue-100 text-blue-700 border-blue-200',
  'Quiet Hours':       'bg-purple-100 text-purple-700 border-purple-200',
};

const TYPE_ICONS: Record<string, string> = {
  'Cleaning Schedule': '🧹',
  'Visitor Policy':    '🚪',
  'Quiet Hours':       '🔕',
};

function getDaysLeft(expiresAt: string | null): { label: string; urgent: boolean } {
  if (!expiresAt) return { label: 'No expiry', urgent: false };
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: 'Expired', urgent: true };
  if (days === 0) return { label: 'Expires today', urgent: true };
  if (days <= 7) return { label: `${days} day${days > 1 ? 's' : ''} left`, urgent: true };
  return { label: `${days} days left`, urgent: false };
}

export default function ActiveRulesPanel() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals?status=approved');
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw className="animate-spin mr-2" size={20} />
        Loading active rules...
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <ShieldCheck size={48} className="mb-3 opacity-30" />
        <p className="text-lg font-medium">No active rules yet</p>
        <p className="text-sm mt-1">Approved proposals will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl px-6 py-4 text-white flex items-center gap-3 shadow-md">
        <ShieldCheck size={28} />
        <div>
          <h2 className="text-lg font-bold">Active Dorm Rules</h2>
          <p className="text-emerald-100 text-sm">{rules.length} rule{rules.length > 1 ? 's' : ''} currently in effect</p>
        </div>
      </div>

      {/* Rules list */}
      {rules.map((rule) => {
        const { label: daysLabel, urgent } = getDaysLeft(rule.expiresAt);
        const isOpen = expanded === rule.id;
        const colorClass = TYPE_COLORS[rule.type] || 'bg-gray-100 text-gray-700 border-gray-200';
        const icon = TYPE_ICONS[rule.type] || '📋';

        return (
          <div
            key={rule.id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all"
          >
            {/* Card header */}
            <button
              onClick={() => setExpanded(isOpen ? null : rule.id)}
              className="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition"
            >
              <span className="text-2xl mt-0.5">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                    {rule.type}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    urgent ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    <Clock size={11} />
                    {daysLabel}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-base leading-snug">{rule.title}</h3>
                <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{rule.description}</p>
              </div>
              <span className="text-gray-400 text-lg ml-2 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-4">
                {/* Initiator */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {rule.initiatorAvatar && (
                    <img src={rule.initiatorAvatar} alt={rule.initiatorName} className="w-6 h-6 rounded-full" />
                  )}
                  <User size={14} className="text-gray-400" />
                  <span>Proposed by <span className="font-semibold text-gray-800">{rule.initiatorName}</span></span>
                </div>

                {/* Full content */}
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    <FileText size={13} />
                    Rule Details
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{rule.content}</p>
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <span>
                    📅 Effective since:{' '}
                    <span className="text-gray-600 font-medium">
                      {new Date(rule.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </span>
                  {rule.expiresAt && (
                    <span>
                      ⏳ Expires:{' '}
                      <span className={`font-medium ${urgent ? 'text-red-500' : 'text-gray-600'}`}>
                        {new Date(rule.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
