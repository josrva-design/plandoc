import React, { useState } from 'react';
import { List, AlertTriangle, X, Check, GlassWater, Flame, Droplets, Scale, Ruler, CookingPot, Plus, Minus, BookOpen } from 'lucide-react';
  import { guideSections } from '../data/guideContent.ts';

export default function GuideSection() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqSection = guideSections.find(s => s.id === 'faq');
  const otherSections = guideSections.filter(s => s.id !== 'faq');

  return (
    <div className="max-w-[960px] mx-auto">
      {/* HERO */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-navy)] text-[var(--color-white)] px-3 py-1 text-[10px] font-bold tracking-widest uppercase mb-3">
              <List size={14} /> GUÍA OFICIAL DOCFITNESS
            </div>
            <h1 className="text-[28px] font-black tracking-tight text-[var(--color-navy)] leading-[0.95]">Guía rápida de tu<br/>plan nutrimental</h1>
            <p className="mt-2 text-[13px] leading-[1.5] text-[var(--color-text-secondary)] max-w-[520px]">
              Todo lo que necesitas saber para no fallar: cómo leer tu menú, qué puedes comer libre, reglas de báscula y qué está prohibido.
            </p>
          </div>
          <div className="hidden md:flex size-12 rounded-[14px] bg-[var(--color-primary)] text-[var(--color-white)] items-center justify-center text-[22px] font-black">?</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide"><span className="size-1.5 rounded-full bg-[var(--color-green)]"/>Menú fijo</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide"><span className="size-1.5 rounded-full bg-[var(--color-primary)]"/>Armar plato</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide"><AlertTriangle size={12} /> No negociables</span>
        </div>
      </div>

      <div className="grid gap-4">
        {otherSections.map((section, sIdx) => {
          const num = sIdx + 1;
          if (section.type === 'faq') return null;
          if (section.type === 'split') {
            return (
              <div key={section.id} className="guide-card">
                <div className="guide-card-head">
                  <div className="guide-num">{num}</div>
                  <div className="guide-title">{section.title}</div>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
                  {(section.sides || []).map((side, idx) => {
                    const isAmber = side.variant === 'amber';
                    const isGreen = side.variant === 'green';
                    const isRed = side.variant === 'red';
                    const badgeColor = isAmber ? 'bg-[var(--color-amber-light)] text-[var(--color-amber-dark)]' : isGreen ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-dark)]' : isRed ? 'bg-[var(--color-red-light)] text-[var(--color-red-dark)]' : 'bg-[var(--color-primary-100)] text-[var(--color-primary-dark)]';
                    const titleColor = isAmber ? 'text-[var(--color-amber-dark)]' : isGreen ? 'text-[var(--color-green)]' : isRed ? 'text-[var(--color-danger-dark)]' : 'text-[var(--color-text-primary)]';
                    return (
                      <div key={idx} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${badgeColor}`}>{side.label}</span>
                          <span className={`text-[11px] font-bold ${titleColor}`}>{side.label}</span>
                        </div>
                        <p className="text-[12px] leading-[1.6] text-[var(--color-text-secondary)] mb-3" dangerouslySetInnerHTML={{ __html: side.body }} />
                        {side.dont && (
                          <div className={`rounded-xl p-3 text-[11px] leading-[1.5] ${isAmber ? 'bg-[var(--color-amber-light)] border border-[var(--color-amber-light)] text-[var(--color-amber-dark)]' : 'bg-[var(--color-danger-light)] border border-[var(--color-danger-light)] text-[var(--color-danger-dark)]'}`}>
                            {(side.dont || []).map((d, i) => <span key={i}><X size={14} className="inline-block mr-1 relative -top-0.5" /> {d}<br/></span>)}
                          </div>
                        )}
                        {side.swaps && (
                          <div className="grid gap-2 text-[11px]">
                            {(side.swaps || []).map((sw, i) => (
                              <div key={i} className="flex gap-2"><span className="font-bold min-w-[70px]">{sw.label}</span><span className="text-[var(--color-text-secondary)]">{sw.value}</span></div>
                            ))}
                          </div>
                        )}
                        {side.items && !side.dont && (
                          <div className="space-y-3 text-[11px] leading-[1.6]">
                            {(side.items || []).map((item, i) => <div key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          if (section.type === 'grid') {
            return (
              <div key={section.id} className="guide-card">
                <div className="guide-card-head">
                  <div className="guide-num">{num}</div>
                  <div className="guide-title">{section.title}</div>
                  {section.note && <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-[var(--color-green)] bg-[var(--color-emerald-50)] border border-[var(--color-emerald-100)] rounded-full px-2 py-0.5">{section.note}</span>}
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-4">
                  {(section.blocks || []).map((block, idx) => (
                    <div key={idx}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">{block.title}</p>
                      {block.highlight ? (
                        <div className="rounded-xl bg-[var(--color-navy)] text-[var(--color-white)] p-3">
                          <p className="text-[11px] leading-[1.5] mt-1 text-[rgba(255,255,255,0.75)]">{(block.items || []).join(', ')}</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {(block.items || []).map((t, i) => <span key={i} className="rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-2.5 py-1 text-[11px]">{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          if (section.type === 'columns') {
            return (
              <div key={section.id} className="guide-card">
                <div className="guide-card-head">
                  <div className="guide-num">{num}</div>
                  <div className="guide-title">{section.title}</div>
                </div>
                <div className="p-0">
                  <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
                    {(section.columns || []).map((col, idx) => (
                      <div key={idx} className="p-4">
                        <p className="text-[11px] font-bold mb-1">{col.title}</p>
                        <p className="text-[11px] leading-[1.6] text-[var(--color-text-secondary)]" dangerouslySetInnerHTML={{ __html: col.body }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* FAQ */}
        {faqSection && (
          <div className="guide-card">
            <div className="guide-card-head">
              <div className="guide-num">{otherSections.length + 1}</div>
              <div className="guide-title">Preguntas frecuentes</div>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {(faqSection.items || []).map((f, i) => (
                <button
                  key={i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full text-left p-4 flex gap-3 items-start hover:bg-[var(--color-bg-subtle)]/60 transition"
                >
                  <span className="mt-0.5 size-5 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[10px] flex-shrink-0">
                    {openFaq === i ? <Minus size={10} /> : <Plus size={10} />}
                  </span>
                  <div className="flex-1">
                    <p className="text-[12px] font-bold leading-[1.4] text-[var(--color-text-primary)]">{f.q}</p>
                    {openFaq === i && (
                      <p className="mt-2 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">{f.a}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
