
import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
// Build xatolarini oldini olish uchun direct import
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.35.0";
import { 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  Search, 
  StickyNote, 
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const DB_KEY = 'smart_notes_v2_db';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 1. Ma'lumotlarni yuklash (Faqat bir marta)
  useEffect(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
          if (parsed.length > 0) setSelectedNoteId(parsed[0].id);
        }
      } catch (e) {
        console.error("DB yuklashda xato:", e);
      }
    }
    setIsInitialLoad(false);
  }, []);

  // 2. Ma'lumotlarni saqlash (Har bir o'zgarishda)
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem(DB_KEY, JSON.stringify(notes));
    }
  }, [notes, isInitialLoad]);

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Yangi eslatma',
      content: '',
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      if (selectedNoteId === id) {
        setSelectedNoteId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [selectedNoteId]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    ));
  }, []);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleAiImprove = async () => {
    if (!selectedNote || !selectedNote.content) return;
    
    setIsAiLoading(true);
    setStatusMsg('AI ishlamoqda...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Quyidagi matnni tahrirlang va chiroyli holatga keltiring: \n\n${selectedNote.content}`,
      });

      const improvedText = response.text;
      if (improvedText) {
        updateNote(selectedNote.id, { content: improvedText.trim() });
        setStatusMsg('Tayyor!');
      }
    } catch (error) {
      console.error("AI Error:", error);
      setStatusMsg('Xatolik yuz berdi.');
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
              <StickyNote className="text-indigo-600" /> Smart Notes
            </h1>
            <button 
              onClick={createNote}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Eslatmalar topilmadi
            </div>
          ) : (
            filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border border-transparent flex items-center group ${
                  selectedNoteId === note.id 
                    ? 'bg-indigo-50 border-indigo-100' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate text-sm mb-1 ${selectedNoteId === note.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {note.title || 'Sarlavhasiz'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {note.content || 'Bo\'sh matn...'}
                  </p>
                </div>
                <ChevronRight size={16} className={`ml-2 transition-transform ${selectedNoteId === note.id ? 'translate-x-0 opacity-100 text-indigo-400' : 'opacity-0 -translate-x-2'}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {selectedNote ? (
          <>
            <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
              <input 
                type="text" 
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                className="text-2xl font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-0 w-1/2"
                placeholder="Eslatma sarlavhasi..."
              />
              
              <div className="flex items-center gap-3">
                {statusMsg && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
                    <CheckCircle2 size={12} /> {statusMsg}
                  </span>
                )}
                
                <button
                  onClick={handleAiImprove}
                  disabled={isAiLoading || !selectedNote.content}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold active:scale-95"
                >
                  {isAiLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  AI Smart Edit
                </button>

                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <textarea
                value={selectedNote.content}
                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                className="w-full h-full text-lg text-slate-700 leading-relaxed resize-none border-none outline-none focus:ring-0"
                placeholder="Bu yerga yozing..."
              />
            </div>
            
            <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center px-8 shrink-0">
              <span>Oxirgi tahrir: {new Date(selectedNote.updatedAt).toLocaleString()}</span>
              <span className="flex items-center gap-1 text-emerald-500 font-medium"><Save size={12} /> Saqlandi</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <StickyNote size={48} />
            </div>
            <p className="text-lg font-medium">Eslatmani tanlang yoki yangisini yarating</p>
          </div>
        )}
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
