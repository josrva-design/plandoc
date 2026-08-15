import React, { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { glossaryTerms } from '../data/guideContent.ts';

const CATS = ['Todo', ...Array.from(new Set(glossaryTerms.map(t => t.cat)))];

export default function GlossarySection() {
  const [openId, setOpenId] = useState('rir');
  const [cat, setCat] = useState('Todo');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return glossaryTerms.filter(t => {
      const matchCat = cat === 'Todo' || t.cat === cat;
      const matchSearch = !search || (t.title + t.subtitle + t.body).toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [cat, search]);

  return (
    <div className="min-h-full bg-[var(--color-bg-elevated)]">
      <div className="max-w-[720px] mx-auto">
        {/* HEADER */}
        <div className="mb-5">
          <p className="glossary-cat">DOCFITNESS • GLOSARIO</p>
          <h1 className="mt-1 text-[28px] font-black tracking-tight leading-[0.9] text-[var(--color-navy)]">Cómo leer tu<br/>rutina</h1>
          <p className="mt-2 text-[13px] leading-[1.5] text-[var(--color-text-secondary)] max-w-[520px]">Términos y métodos en una sola hoja. Toca para desplegar.</p>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <div className="glossary-card flex items-center gap-2 px-3 py-2.5">
            <BookOpen size={16} className="text-[var(--color-text-muted)] shrink-0" />
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar RIR, RPE, biserie, FLEX..."
              className="glossary-search"
            />
            {search && (
              <button onClick={()=>setSearch('')} className="text-[var(--color-text-muted)] text-[11px] shrink-0">✕</button>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
          {CATS.map(c=>(
            <button
              key={c}
              onClick={()=>setCat(c)}
              className={`glossary-filter-btn ${cat===c ? 'glossary-filter-btn--active' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="glossary-card divide-y divide-[var(--color-border)]">
          {filtered.map(t=> {
            const isOpen = openId===t.id;
            return (
              <div key={t.id} className="group">
                <button
                  onClick={()=>setOpenId(isOpen ? null : t.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--color-bg-subtle)]/60 transition"
                >
                  <div className="size-8 rounded-full bg-[var(--color-navy)] text-white flex items-center justify-center text-[13px] shrink-0">
                    <span className="text-[10px] font-black">{t.title.slice(0,2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="glossary-title">{t.title}</p>
                      <p className="glossary-sub truncate">{t.subtitle}</p>
                    </div>
                    <p className="mt-0.5 glossary-cat">{t.cat}</p>
                  </div>
                  <div className={`size-6 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center text-[10px] text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="ml-[44px]">
                      <div className="rounded-xl bg-[var(--color-bg-elevated)] p-3">
                         <p className="glossary-body whitespace-pre-line">{t.body}</p>
                      </div>
                      {t.example && (
                        <div className="mt-2.5 flex gap-2 items-start">
                          <span className="glossary-badge bg-[var(--color-navy)] text-white mt-0.5">EJEMPLO</span>
                          <p className="glossary-example">{t.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length===0 && (
          <div className="mt-6 text-center text-[13px] text-[var(--color-text-muted)]">Sin resultados para "{search}" en {cat}</div>
        )}

        <div className="mt-6 glossary-card bg-[var(--color-navy)] text-white p-4 flex gap-3">
          <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <BookOpen size={14} className="text-white/80" />
          </div>
          <div>
            <p className="text-[12px] font-bold">Tip rápido</p>
            <p className="mt-1 text-[11px] leading-[1.5] text-white/60">Toca cualquier término para ver el ejemplo visual. Todo está en una sola hoja, sin cambiar de pantalla.</p>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] tracking-widest uppercase text-[var(--color-text-muted)]">DocFitness • Glosario • v2026</p>
      </div>
    </div>
  );
}
