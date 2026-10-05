"use client";

import React, { useState } from "react";
import { X, Mail, Copy, Check, Send, Sparkles } from "lucide-react";
import { StakeholderEmail } from "@/types";

interface EmailModalProps {
  isOpen: boolean;
  email: StakeholderEmail | null;
  onClose: () => void;
  onSendEmail: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  email,
  onClose,
  onSendEmail,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !email) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl border border-white/10 max-w-2xl w-full bg-slate-900/95 p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Stakeholder Update Email</h3>
            <p className="text-xs text-slate-400">Formatted executive dispatch ready for transmission</p>
          </div>
        </div>

        {/* Email Header Fields */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium w-16">To:</span>
            <span className="font-mono text-cyan-300">
              leadership@nova.corp, eng-leads@nova.corp, product-ops@nova.corp
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium w-16">From:</span>
            <span className="font-mono text-slate-300">autopm-bot@nova.corp (Automated PM Engine)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium w-16">Subject:</span>
            <span className="font-semibold text-white">{email.subject}</span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-4 rounded-xl bg-slate-950 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed border border-white/5 max-h-[300px] overflow-y-auto">
          {email.body}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={onSendEmail}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email (Demo Mode)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
