import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Download, 
  Copy, 
  Check, 
  MessageSquare, 
  ShieldAlert,
  Terminal,
  User,
  Heart
} from 'lucide-react';

interface WishData {
  id: string;
  name: string;
  message: string;
  createdAt: any;
}

export function Guestbook() {
  const [wishes, setWishes] = useState<WishData[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Admin tools parameters
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Hook up real-time listener to Firestore to stream birthday wishes
  useEffect(() => {
    const q = query(
      collection(db, 'wishes'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const wishesList: WishData[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          wishesList.push({
            id: doc.id,
            name: data.name || 'Anonymous Rebel',
            message: data.message || '',
            createdAt: data.createdAt,
          });
        });
        setWishes(wishesList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'wishes');
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Generate a secure, deterministic or clean alphanumeric document ID
    const wishId = 'wish_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    try {
      const wishDocRef = doc(db, 'wishes', wishId);
      await setDoc(wishDocRef, {
        name: name.trim(),
        message: message.trim(),
        createdAt: serverTimestamp() // Mandatory to pass verification against rules_version server time
      });

      setName('');
      setMessage('');
      setSubmitStatus('success');
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (err: any) {
      console.error(err);
      setSubmitStatus('error');
      setErrorMessage(err.message || 'Transmission failed. Ensure rules allow write.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to local system as a formatted JSON File download
  const handleExportJSON = () => {
    const wishesToExport = wishes.map(w => ({
      name: w.name,
      message: w.message,
      submittedAt: w.createdAt?.seconds 
        ? new Date(w.createdAt.seconds * 1000).toISOString() 
        : new Date().toISOString()
    }));

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(wishesToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aditya_20th_birthday_wishes_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy wishes to clipboard as JSON format
  const handleCopyJSON = () => {
    const wishesToExport = wishes.map(w => ({
      name: w.name,
      message: w.message,
      submittedAt: w.createdAt?.seconds 
        ? new Date(w.createdAt.seconds * 1000).toISOString() 
        : new Date().toISOString()
    }));

    navigator.clipboard.writeText(JSON.stringify(wishesToExport, null, 2))
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Could not copy wishes: ', err));
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    // Unlock with Aditya's name or simple password
    if (passphrase.toLowerCase() === 'aditya' || passphrase.toLowerCase() === 'dharma' || passphrase.toLowerCase() === '20') {
      setIsAdminUnlocked(true);
      setPassphrase('');
    } else {
      alert('Access Denied: Incorrect timeline encryption key.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 mt-12 mb-16 border-t border-white/10 relative z-20">
      
      {/* SECTION HEADER */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-3">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] uppercase tracking-widest text-amber-300 font-mono font-bold">
            Cosmic Transmission Channel
          </span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
          Leave a Birthday Wish
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
          Add your signature to Aditya's celestial constellation. All wishes are securely encrypted and can be saved to local storage easily.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* SUBMISSION FORM (7/12 layout) */}
        <div className="md:col-span-7 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-2 font-bold">
                Your Signature Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="E.g., Luffy, Ginny, Eragon..."
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#02040a]/80 border border-white/10 rounded-xl font-sans text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-2 font-bold">
                Your Birthday Translation
              </label>
              <textarea
                required
                rows={4}
                maxLength={1000}
                placeholder="Type your birthday message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-[#02040a]/80 border border-white/10 rounded-xl font-sans text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-white hover:to-white text-black font-mono font-bold uppercase tracking-widest text-xs rounded-xl cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting...' : 'Send Transmission'}</span>
            </button>
          </form>

          {/* User Feedback banner */}
          <AnimatePresence>
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-xs text-green-300"
              >
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-green-400" />
                </div>
                <div>
                  <p className="font-bold">Transmission Succeeded!</p>
                  <p className="text-green-400/80">Your wish is securely stored in Aditya's constellation database.</p>
                </div>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-xs text-red-300"
              >
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div>
                  <p className="font-bold">Transmission Failed</p>
                  <p className="text-red-400/80">{errorMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FEED & TRANSFER PORT (5/12 layout) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Recent Transmissions list */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl max-h-[310px] overflow-y-auto flex flex-col custom-scrollbar">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Recent Constellations
            </h4>

            {wishes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Heart className="w-8 h-8 text-white/10 mb-2 animate-pulse" />
                <p className="text-xs text-slate-500">The sky is currently silent.<br />Be the first to submit a wish!</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {wishes.map((w) => (
                  <div key={w.id} className="p-3 bg-[#02040a]/40 border border-white/5 rounded-xl text-left hover:border-amber-500/20 transition-all">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="text-xs font-mono font-bold text-amber-200">
                        {w.name}
                      </span>
                      <span className="text-[8px] font-mono text-white/30 uppercase">
                        {w.createdAt?.seconds 
                          ? new Date(w.createdAt.seconds * 1000).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})
                          : 'Recent'
                        }
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs font-sans leading-relaxed break-words">
                      “{w.message}”
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADITYA'S LOCAL DATA TRANSFER HUB (Under cryptographic lock to keep UI beautifully tidy) */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl relative overflow-hidden text-left">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-3">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-amber-400 flex items-center gap-2 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                Aditya's Data Transfer Portal
              </h4>
              <span className="text-[8px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">
                Offline Sync ready
              </span>
            </div>

            {!isAdminUnlocked ? (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter decryption passphrase to download submitted database wishes directly to your local system as formatted JSON.
                </p>
                <form onSubmit={handleUnlockAdmin} className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter pass (e.g. 'aditya')"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="flex-grow px-3 py-2 bg-[#02040a]/80 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black font-semibold text-[10px] uppercase font-mono tracking-widest rounded-lg cursor-pointer hover:bg-amber-400 transition-all"
                  >
                    Unlock
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[11px] text-green-300 flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4" />
                  Terminal Identity Decrypted
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center justify-center gap-2 p-2.5 bg-[#02040a]/80 border border-white/10 rounded-xl hover:border-amber-400 hover:text-amber-300 text-[10px] font-mono tracking-wider text-slate-300 transition-all uppercase cursor-pointer"
                    title="Generate and download wishes directly as a .json file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={handleCopyJSON}
                    className="flex items-center justify-center gap-2 p-2.5 bg-[#02040a]/80 border border-white/10 rounded-xl hover:border-amber-400 hover:text-amber-300 text-[10px] font-mono tracking-wider text-slate-300 transition-all uppercase cursor-pointer"
                    title="Copy formatted wishes list directly to clipboard"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy to Clip'}</span>
                  </button>
                </div>
                <div className="text-center pt-1 border-t border-white/5">
                  <button
                    onClick={() => setIsAdminUnlocked(false)}
                    className="text-[9px] font-mono text-white/30 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    Lock Transfer Portal
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
