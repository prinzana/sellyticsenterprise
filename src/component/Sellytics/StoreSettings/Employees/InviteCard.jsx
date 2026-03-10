import { useState } from 'react';
import { FaCopy, FaWhatsapp } from 'react-icons/fa';
import { Link2, Check } from 'lucide-react';

export default function InviteCard({ inviteLink, onGenerate }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <button
        onClick={onGenerate}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
      >
        <Link2 className="w-4 h-4 text-indigo-500" />
        Generate Invite Link
      </button>

      {inviteLink && (
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5">
          <input
            value={inviteLink}
            readOnly
            className="flex-1 min-w-0 px-3 py-1.5 bg-transparent text-xs text-slate-600 dark:text-slate-400 outline-none truncate"
          />
          <button
            onClick={copy}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${copied
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <FaCopy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(inviteLink)}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all flex-shrink-0"
            title="Share via WhatsApp"
          >
            <FaWhatsapp className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
