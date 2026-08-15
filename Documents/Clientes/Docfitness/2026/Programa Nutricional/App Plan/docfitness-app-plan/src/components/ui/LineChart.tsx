function LineChart({ series, consultas }) {
  const W = 640, H = 220, PAD = 32;
  const allValues = series.flatMap(s => s.data.filter(v => typeof v === 'number'));
  if (!allValues.length) return <div className="h-[220px] flex items-center justify-center text-[var(--color-text-secondary)] text-sm">Agrega datos en {consultas[0]}...</div>;
  const min = Math.min(...allValues) * 0.95;
  const max = Math.max(...allValues) * 1.05;
  const range = max - min || 1;

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[500px] h-[220px]">
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = PAD + t * (H - PAD * 2);
          return <line key={t} x1={PAD} y1={y} x2={W - 10} y2={y} stroke="var(--color-border)" strokeWidth="1" />;
        })}
        {consultas.map((c, i) => {
          const x = PAD + (i / (consultas.length - 1)) * (W - PAD - 10);
          return <text key={c} x={x} y={H - 4} fontSize="10" fill="var(--color-text-secondary)" textAnchor="middle" fontWeight="600">{c}</text>;
        })}
        {series.map(s => {
          const pts = s.data.map((v, i) => {
            if (typeof v !== 'number') return null;
            const x = PAD + (i / (consultas.length - 1)) * (W - PAD - 10);
            const y = PAD + (1 - (v - min) / range) * (H - PAD * 2);
            return { x, y, v };
          }).filter(Boolean);
          if (pts.length < 2) return null;
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
              {pts.map((p, j) => (
                <circle key={j} cx={p.x} cy={p.y} r="4" fill="var(--white)" stroke={s.color} strokeWidth="2.5" />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex gap-3 justify-center">
        {series.map(s => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-primary)]">
            <span className="size-2 rounded-full" style={{ background: s.color }} />{s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default LineChart;