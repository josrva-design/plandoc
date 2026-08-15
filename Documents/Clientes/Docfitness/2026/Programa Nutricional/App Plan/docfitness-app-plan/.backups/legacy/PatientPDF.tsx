// LEGACY: PDF export no activo. El flujo actual es HTML para WhatsApp via ExportPlan.ts.
// Este archivo NO está importado en ningún lado. No eliminar sin confirmar con el equipo.
import { Document, Page, View, Text, Image, Link, Svg, Circle, Path, Rect, Font } from '@react-pdf/renderer';
import type { ClientPlan } from '../core/types';
import { guideSections, glossaryTerms } from '../data/guideContent.ts';
import { roundDelta } from '../utils/nutritionHelpers';
import { C, styles as pdfStyles } from './PatientPDF.styles';

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.invalidate(() => {
    window.location.reload();
  });
}

Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });
Font.register({ family: 'Inter', src: '/fonts/Inter-Bold.ttf', fontWeight: 700 });
Font.register({ family: 'Inter', src: '/fonts/Inter-ExtraBold.ttf', fontWeight: 800 });

const DAYS = [
  { key: 'monday', label: 'LUN', full: 'Lunes' },
  { key: 'tuesday', label: 'MAR', full: 'Martes' },
  { key: 'wednesday', label: 'MIÉ', full: 'Miércoles' },
  { key: 'thursday', label: 'JUE', full: 'Jueves' },
  { key: 'friday', label: 'VIE', full: 'Viernes' },
  { key: 'saturday', label: 'SÁB', full: 'Sábado' },
  { key: 'sunday', label: 'DOM', full: 'Domingo' },
];

const COVER_LINE1 = "SI QUIERES TENER LO QUE POCOS TIENEN";
const COVER_LINE2 = "DEBER AS ESTAR DISPUESTO A HACER LO QUE POCOS HACEN";
const COVER_BRAND = "DocFitness";

function LogoHeader() {
  return (
    <View style={pdfStyles.logoHeader}>
      <Image src="/docfitness_logo.png" style={pdfStyles.logo} />
    </View>
  );
}

function Footer() {
  return (
    <View style={pdfStyles.footer}>
      <View style={pdfStyles.footerDivider} />
      <Image src="/docfitness_logo.png" style={pdfStyles.footerLogo} />
      <Text style={pdfStyles.footerBrandText}>ESTÉTICA CORPORAL | MEDICINA | NUTRICIÓN | ENTRENAMIENTO</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={pdfStyles.sectionTitle}>{children}</Text>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={pdfStyles.card}>
      <Text style={pdfStyles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function NavCard({ title, value, unit = '', anterior, delta }: { title: string; value: string; unit?: string; anterior?: string; delta?: string }) {
  return (
    <View style={pdfStyles.navCard}>
      <Text style={pdfStyles.navCardTitle}>{title}</Text>
      <View style={pdfStyles.navCardValueRow}>
        {anterior && <Text style={pdfStyles.navCardAnterior}>{anterior}{unit}</Text>}
        <Text style={pdfStyles.navCardActual}>{value}{unit}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
        {anterior && <Text style={pdfStyles.navCardSubtext}>Anterior → Actual</Text>}
        {delta && <Text style={pdfStyles.navCardDelta}>{delta}</Text>}
      </View>
    </View>
  );
}

function MeasureCard({ title, anterior, actual, delta }: { title: string; anterior: string; actual: string; delta: number }) {
  return (
    <View style={pdfStyles.measureCard}>
      <Text style={pdfStyles.measureTitle}>{title}</Text>
      <View style={pdfStyles.statRow}>
        <Text style={pdfStyles.statAnterior}>{anterior}</Text>
        <Text style={pdfStyles.statActual}>{actual}</Text>
        <Text style={pdfStyles.statDelta}>{delta < 0 ? '↓' : '↑'} {Math.abs(delta)}</Text>
      </View>
    </View>
  );
}

function MiniCard({ title, value, suffix = '', pct = 0 }: { title: string; value: string; suffix?: string; pct?: number }) {
  return (
    <View style={pdfStyles.miniCard}>
      <Text style={pdfStyles.miniTitle}>{title}</Text>
      <Text style={pdfStyles.miniValue}>{value}{suffix}</Text>
      <View style={pdfStyles.miniProgress}>
        <View style={[pdfStyles.miniProgressFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>
    </View>
  );
}

function inferCategoria(f: any): string {
  const m = f.macros || {};
  const p = m.proteinas || f.p || 0;
  const c = m.carbos || f.c || 0;
  const g = m.grasas || f.g || 0;
  if (p > 0 && p >= c && p >= g) return 'PROTEÍNA';
  if (c > 0 && c > p && c >= g) return 'CARBOHIDRATO';
  if (g > 0 && g > p && g > c) return 'GRASA';
  return 'OTROS';
}

const CATEGORIA_CONFIG: Record<string, { label: string }> = {
  PROTEÍNA: { label: 'Elige una proteína' },
  CARBOHIDRATO: { label: 'Elige un carbohidrato' },
  GRASA: { label: 'Elige una grasa' },
  OTROS: { label: 'Otros' },
};

function getTecnicaColor(tecnica: string): string {
  const t = tecnica.toUpperCase();
  if (t.includes('DROPSET')) return C.orange;
  if (t.includes('TOP SET')) return C.primary;
  if (t.includes('BACK-OFF')) return C.green;
  if (t.includes('REST-PAUSE')) return C.red;
  if (t.includes('AL FALLO') || t.includes('FALLO')) return C.red;
  if (t.includes('MYO-REPS')) return C.deep;
  if (t === 'BISERIE' || t === 'TRISERIE') return C.orange;
  if (t === 'CIRCUITO') return C.green;
  return C.deep;
}

function parsePrescripcion(p: string) {
  if (!p || p === '—') return { sets: '—', reps: '—', descanso: '—', rir: '—', tecnica: '—', notas: '—' };
  const seriesMatch = p.match(/(\d+)\s*(?:series|x)/i);
  const repsMatch = p.match(/(\d+\s*-\s*\d+|\d+)\s*reps?/i);
  const restMatch = p.match(/•\s*(\d+(?:\.\d+)?)\s*(seg?s?|min|m)/i);
  const rirMatch = p.match(/RIR\s*(\d+)/i);
  const tecnicaMatch = p.match(/(biserie|triserie|drop\s*set|top\s*set|back\s*off|rest\s*pause|fall\s*al|fall\s*myo|fall)/i);
  const tecnica = tecnicaMatch ? tecnicaMatch[0].toUpperCase().replace(/['\s]/g, ' ') : '—';
  return {
    sets: seriesMatch ? seriesMatch[1] : '—',
    reps: repsMatch ? repsMatch[1].replace(/\s/g, '') : '—',
    descanso: restMatch ? `${restMatch[1]}${restMatch[2].startsWith('min') ? ' MIN' : 's'}` : '—',
    rir: rirMatch ? rirMatch[1] : '—',
    tecnica,
    notas: '—',
  };
}

function formatEjercicioDisplay(p: string, bloqueTipo: string): string {
  if (!p || p === '-') return '—';
  const isMulti = bloqueTipo === 'BISERIE' || bloqueTipo === 'TRISERIE';
  const isTimeBased = !/reps?\s*(c\/u)?/i.test(p);
  const seriesMatch = p.match(/(\d+)\s+series/i) || p.match(/(\d+)x\s/i);
  const repsMatch = p.match(/(\d+\s*-\s*\d+|\d+)\s*reps?/i);
  const timeMatch = p.match(/•?\s*(\d+(?:\.\d+)?)\s*(MIN|min|seg|s)\b/i);
  const descansoMatch = p.match(/•\s*(\d+(?:\.\d+)?)\s*(s|seg|min|m)/i);
  const rirMatch = p.match(/RIR\s*(\d+)/i);

  if (isTimeBased) {
    if (isMulti) {
      let r = '';
      if (repsMatch) r = `${repsMatch[1]} reps`;
      if (rirMatch) r += ` • RIR ${rirMatch[1]}`;
      return r || p;
    }
    let r = '';
    if (seriesMatch) r += `${seriesMatch[1]}x`;
    if (timeMatch) {
      const unit = timeMatch[2].toLowerCase() === 'min' ? 'MIN' : timeMatch[2];
      r += ` ${timeMatch[1]}${unit === 'seg' || unit === 's' ? 's' : unit}`;
    }
    const descMatch = descansoMatch;
    if (descMatch) r += ` • ${descMatch[1]} seg descanso`;
    if (rirMatch) r += ` • RIR ${rirMatch[1]}`;
    return r || p;
  }

  if (isMulti) {
    let r = '';
    if (repsMatch) r = `${repsMatch[1]} reps`;
    if (rirMatch) r += ` • RIR ${rirMatch[1]}`;
    return r || p;
  }

  let r = '';
  if (seriesMatch) r += `${seriesMatch[1]} series, `;
  if (repsMatch) r += `${repsMatch[1]} reps`;
  if (descansoMatch) r += ` • ${descansoMatch[1]} seg descanso`;
  if (rirMatch) r += ` • RIR ${rirMatch[1]}`;
  return r || p;
}

const BLOQUE_COLORS: Record<string, string> = {
  'CALENTAMIENTO GENERAL': C.orange,
  'ESTIRAMIENTO DINÁMICO / MOVILIDAD': C.deep,
  'CALENTAMIENTO ESPECÍFICO': C.deep,
  'SERIES DE APROXIMACIÓN': C.orange,
  'ENTRENAMIENTO PRINCIPAL': C.deep,
  'ABDOMEN': C.primary,
  'default': C.textTertiary,
};

function getBloqueColor(bloqueTipo: string): string {
  return BLOQUE_COLORS[bloqueTipo] || C.textTertiary;
}

function BloqueEjercicios({ bloque, showHeader = true, blockLabel }: { bloque: any; showHeader?: boolean; blockLabel?: string }) {
  const bloqueColor = getBloqueColor(bloque.tipo);
  const tipoLabel = bloque.tipo === 'BISERIE' ? 'Biserie' : bloque.tipo === 'TRISERIE' ? 'Triserie' : bloque.tipo === 'SERIES DE APROXIMACIÓN' ? 'Aproximación' : bloque.tipo === 'ENTRENAMIENTO PRINCIPAL' ? 'Entrenamiento' : bloque.tipo === 'CALENTAMIENTO GENERAL' ? 'Calentamiento G' : bloque.tipo === 'ESTIRAMIENTO DINÁMICO / MOVILIDAD' ? 'Movilidad' : bloque.tipo === 'CALENTAMIENTO ESPECÍFICO' ? 'Calentamiento E' : 'Simple';
  const isAproximacion = bloque.tipo === 'SERIES DE APROXIMACIÓN';
  const rowBg = isAproximacion ? '#EFEFF1' : '#FFFFFF';

  const groups = (bloque.ejercicios || []).reduce((acc: Record<string, any[]>, ex: any) => {
    const g = blockLabel ? (ex.grupo || 'default') : (ex.grupo || 'default');
    if (!acc[g]) acc[g] = [];
    acc[g].push(ex);
    return acc;
  }, {} as Record<string, any[]>);

  const SUBTIPO_ORDER = ['Serie Simple', 'Biserie', 'Triserie', 'Circuito', 'Normal'];
  let groupEntries = Object.entries(groups);
  if (blockLabel) {
    groupEntries = groupEntries.sort((a, b) => {
      const subA = (a[1][0]?.subtipo || 'Normal');
      const subB = (b[1][0]?.subtipo || 'Normal');
      const idxA = SUBTIPO_ORDER.indexOf(subA === 'Normal' ? 'Serie Simple' : subA);
      const idxB = SUBTIPO_ORDER.indexOf(subB === 'Normal' ? 'Serie Simple' : subB);
       return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
     });
   }

   return (
     <View style={{ width: '100%' }}>
       {showHeader && (
         <View style={pdfStyles.exerciseTableHeader}>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSerie, { textAlign: 'center' }]}>Serie</Text>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColVideo, { textAlign: 'center' }]}>VID</Text>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColEjercicio]}>EJERCICIO</Text>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSets, { textAlign: 'center' }]}>SETS</Text>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColReps, { textAlign: 'center' }]}>REPS</Text>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColTecnica, { textAlign: 'center' }]}>TÉCNICA</Text>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColRir, { textAlign: 'center' }]}>RIR</Text>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColDescanso, { textAlign: 'center' }]}>DESCANSO</Text>
           <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColNotas, { textAlign: 'center' }]}>NOTAS</Text>
         </View>
       )}

       {groupEntries.map(([groupName, exercises], groupIdx) => {
         const firstEx = exercises[0] || {};
         const exSubtipo = firstEx.subtipo || 'Normal';
         const subtipoLabel = exSubtipo === 'Normal' ? 'Serie Simple' : exSubtipo;
         const isGrouped = exSubtipo !== 'Normal';
         const showGroupHeader = isGrouped;

         return (
           <View key={groupName}>
             {showGroupHeader && (
               <View style={pdfStyles.mealCategoryHeader}>
                 <Text style={pdfStyles.mealCategoryText}>{subtipoLabel.toUpperCase()}</Text>
               </View>
             )}
             {exercises.map((ex: any, eIdx: number) => {
               const isOption = bloque.tipo === 'ELIGE 1 OPCIÓN';
               const parsed = parsePrescripcion(ex.prescripcion || '');
               const exOriginalIndex = bloque.ejercicios.findIndex((bEx: any) => bEx === ex);
               const displayIdx = exOriginalIndex >= 0 ? exOriginalIndex + 1 : eIdx + 1;
               const exSubtipoRow = ex.subtipo || 'Normal';
               const exTipoLabel = exSubtipoRow === 'Normal' ? 'SIMPLE' : exSubtipoRow.toUpperCase();

               return (
                 <View key={eIdx} style={[
                   pdfStyles.exerciseTableRow,
                   { backgroundColor: rowBg },
                   eIdx === exercises.length - 1 && groupIdx === groupEntries.length - 1 && pdfStyles.exerciseTableRowLast
                 ]}>
                   <View style={pdfStyles.exerciseTableColSerie}>
                     <View style={{ position: 'relative', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                       <Svg width={24} height={24} viewBox="0 0 24 24">
                         <Circle cx={12} cy={12} r={12} fill="#0A2540" />
                       </Svg>
                       <View style={{ position: 'absolute', width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
                         <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 800 }}>{bloque.letra}{displayIdx}</Text>
                       </View>
                     </View>
                   </View>

                   <View style={pdfStyles.exerciseTableColVideo}>
                     <Svg width={24} height={24} viewBox="0 0 24 24">
                       <Circle cx={12} cy={12} r={12} fill="#0B63CE" />
                       <Path d="M9 7 L17 12 L9 17 Z" fill="#FFFFFF" />
                     </Svg>
                   </View>

                   <View style={pdfStyles.exerciseTableColEjercicio}>
                     <Text style={pdfStyles.exerciseTableRowCell}>{ex.nombre}</Text>
                     <Text style={pdfStyles.exerciseTableRowCell}>{ex.prescripcion}</Text>
                   </View>

                   <View style={pdfStyles.exerciseTableColSets}>
                     <Text style={pdfStyles.exerciseTableRowCell}>{ex.sets}</Text>
                   </View>

                   <View style={pdfStyles.exerciseTableColReps}>
                     <Text style={pdfStyles.exerciseTableRowCell}>{ex.reps}</Text>
                   </View>

                   <View style={pdfStyles.exerciseTableColTecnica}>
                     <Text style={pdfStyles.exerciseTableRowCell}>{ex.tecnica}</Text>
                   </View>

                   <View style={pdfStyles.exerciseTableColRir}>
                     <Text style={pdfStyles.exerciseTableRowCell}>{ex.rir}</Text>
                   </View>

                   <View style={pdfStyles.exerciseTableColDescanso}>
                     <Text style={pdfStyles.exerciseTableRowCell}>{ex.descanso}</Text>
                   </View>

                   <View style={pdfStyles.exerciseTableColNotas}>
                     <Text style={[pdfStyles.exerciseTableRowCell, pdfStyles.exerciseTableColNotas, { textAlign: 'left', fontWeight: 500, color: '#0D2640', fontSize: 10 }]}>{parsed.notas}</Text>
                   </View>
                 </View>
               );
             })}
           </View>
         );
       })}
     </View>
   );
}

function PatientPDF({ plan }: { plan: ClientPlan }) {
  const p = plan?.person || { nombre: 'Paciente' };
  const avances = plan?.avances || {};
  const estadisticas = plan?.estadisticas || {};
  const tNutri = plan?.tratamientoNutricional || {};
  const tEntre = plan?.tratamientoEntrenamiento || {};
  const clinico = plan?.clinico || {};
  const meals = plan?.meals || [];
  const routines = plan?.routines || {};
  const supplements = plan?.supplements || {};

  return (
    <Document>
      {/* ========== PORTADA ========== */}
      <Page key="cover" size={[1080, 1920]} style={pdfStyles.coverPage}>
        <LogoHeader />
        <View style={pdfStyles.coverContent}>
          <Image src="/doc-logo-white.svg" style={pdfStyles.coverLogo} />
          <View style={{ flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <Text style={[pdfStyles.coverTitle, { marginBottom: -8 }]}>PLAN</Text>
            <Text style={pdfStyles.coverTitle}>INTEGRAL</Text>
          </View>
          <Text style={pdfStyles.coverTagline}>"Si quieres tener lo que pocos tienen, {"\n"}debes estar dispuesto a hacer lo que pocos hacen"</Text>
          <View style={pdfStyles.socialIcons}>
            <View style={pdfStyles.socialIcon}>
              <Svg width={64} height={64} viewBox="0 0 24 24" fill="#FFFFFF">
                <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </Svg>
            </View>
            <View style={pdfStyles.socialIcon}>
              <Svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
                <Rect fill="none" x={2} y={2} width={20} height={20} rx={5} ry={5} />
                <Path fill="none" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
              </Svg>
            </View>
            <View style={pdfStyles.socialIcon}>
              <Svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
                <Path fill="none" d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                <Path fill="none" d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" />
              </Svg>
            </View>
            <View style={pdfStyles.socialIcon}>
              <Svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
                <Path fill="none" d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
                <Path fill="none" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
              </Svg>
            </View>
          </View>
        </View>
        <View style={pdfStyles.coverFooter}>
          <Text style={pdfStyles.coverFooterText}>Dr. Diego Sosa</Text>
          <Text style={pdfStyles.coverFooterText}>Ced. Prof 9036647</Text>
        </View>
      </Page>

      {/* ========== PÁGINA 1: HEADER + AVANCES + ESTRATEGIAS + CLÍNICO ========== */}
      <Page key="summary" size={[1080, 1920]} style={pdfStyles.page}>
        <LogoHeader />
        <View style={pdfStyles.planBadge}>
          <Text style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(0,0,0,0.6)' }}>Plan activo</Text>
        </View>
        <Text style={pdfStyles.greeting}>Hola, {p.nombre?.split(' ')[0] || 'Paciente'}</Text>
        <Text style={pdfStyles.subtitle}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        {plan?.proximaConsulta && (
          <Text style={pdfStyles.nextUpdate}>Próxima actualización: {plan.proximaConsulta}</Text>
        )}

        <SectionTitle>Avances</SectionTitle>
        <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, fontWeight: 600 }}>Comparativa mensual • Anterior vs Actual</Text>

        <NavCard
          title={avances.peso?.label || 'Peso'}
          value={avances.peso?.actual || '—'}
          unit=" kg"
          anterior={avances.peso?.anterior ? String(avances.peso.anterior) : undefined}
          delta={avances.peso?.anterior ? `â†‘ +${roundDelta((avances.peso.actual - avances.peso.anterior) || 0)}` : undefined}
        />

        <View style={pdfStyles.measureGrid}>
          {avances.abdomen && <MeasureCard title="Abdomen" anterior={avances.abdomen.anterior} actual={avances.abdomen.actual} delta={avances.abdomen.delta || 0} />}
          {avances.grasaKg && <MeasureCard title="Grasa kg" anterior={avances.grasaKg.anterior} actual={avances.grasaKg.actual} delta={avances.grasaKg.delta || 0} />}
          {avances.grasaPct && <MeasureCard title="Grasa %" anterior={avances.grasaPct.anterior} actual={avances.grasaPct.actual} delta={avances.grasaPct.delta || 0} />}
          {avances.pliegue && <MeasureCard title="Pliegue" anterior={avances.pliegue.anterior} actual={avances.pliegue.actual} delta={avances.pliegue.delta || 0} />}
        </View>

        <View style={pdfStyles.greenCard}>
          <Text style={pdfStyles.greenCardTitle}>Adherencia al plan</Text>
          <Text style={pdfStyles.greenCardValue}>{estadisticas.adherencia}%</Text>
          <View style={pdfStyles.progressBar}>
            <View style={[pdfStyles.progressFill, { width: `${estadisticas.adherencia}%` }]} />
          </View>
        </View>

        <View style={pdfStyles.miniGrid}>
          <MiniCard title="Nutrición" value={String(estadisticas.nutricion || 0)} suffix="%" pct={estadisticas.nutricion || 0} />
          <MiniCard title="Entreno" value={String(estadisticas.entrenamiento || 0)} suffix="%" pct={estadisticas.entrenamiento || 0} />
          <MiniCard title="Cardio" value={String(Math.min(Math.round((estadisticas.cardio || 0) / 3 * 100), 100))} suffix="%" pct={Math.min(Math.round((estadisticas.cardio || 0) / 3 * 100), 100)} />
          <MiniCard title="Descanso" value={String(Math.min(Math.round((parseFloat(estadisticas.descanso || '0') / 8) * 100), 100))} suffix="%" pct={Math.min(Math.round((parseFloat(estadisticas.descanso || '0') / 8) * 100), 100)} />
        </View>

        <Card title="Estrategia nutricional">
          <View style={pdfStyles.macroGrid}>
            <Text style={pdfStyles.strategyPill}>{tNutri.estrategia || '—'}</Text>
            <Text style={pdfStyles.macroPill}>{tNutri.kcal || '—'} kcal</Text>
            <Text style={pdfStyles.macroPill}>{tNutri.proteina || '—'}P</Text>
            <Text style={pdfStyles.macroPill}>{tNutri.carbos || '—'}C</Text>
            <Text style={pdfStyles.macroPill}>{tNutri.grasas || '—'}G</Text>
          </View>
        </Card>

        {tNutri.suple && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: 700, color: '#0D2640', marginBottom: 6 }}>Suplementación recomendada</Text>
            <Text style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>{tNutri.suple}</Text>
          </View>
        )}

        <Card title="Tratamiento Deportivo">
          <View style={pdfStyles.macroGrid}>
            <Text style={pdfStyles.macroPill}>{tEntre.dias || '—'} días</Text>
            <Text style={pdfStyles.macroPill}>{tEntre.cardio || '—'}</Text>
            <Text style={pdfStyles.macroPill}>{tEntre.pasos || '—'} pasos</Text>
          </View>
        </Card>

        {(tEntre.rir || tEntre.indic) && (
          <View style={{ marginBottom: 16 }}>
            {tEntre.rir && (
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>
                <Text style={{ fontWeight: 700 }}>RIR objetivo:</Text> {tEntre.rir}
              </Text>
            )}
            {tEntre.indic && (
              <Text style={{ fontSize: 12, color: '#374151' }}>
                <Text style={{ fontWeight: 700 }}>Indicaciones:</Text> {tEntre.indic}
              </Text>
            )}
          </View>
        )}

        {(clinico.retroalimentacion?.length > 0 || clinico.diagnostico?.length > 0 || clinico.objetivos?.length > 0) && (
          <Card title="Información clínica">
            {clinico.retroalimentacion?.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={pdfStyles.cardTitle}>Retroalimentación</Text>
                {clinico.retroalimentacion.map((item, i) => (
                  <View key={i} style={pdfStyles.clinicalItem}>
                    <Text style={pdfStyles.clinicalNumber}>{i + 1}.</Text>
                    <Text style={pdfStyles.clinicalText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            {clinico.diagnostico?.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={pdfStyles.cardTitle}>Diagnóstico</Text>
                {clinico.diagnostico.map((item, i) => (
                  <View key={i} style={pdfStyles.clinicalItem}>
                    <Text style={pdfStyles.clinicalNumber}>{i + 1}.</Text>
                    <Text style={pdfStyles.clinicalText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            {clinico.objetivos?.length > 0 && (
              <View>
                <Text style={pdfStyles.cardTitle}>Objetivos</Text>
                {clinico.objetivos.map((item, i) => (
                  <View key={i} style={pdfStyles.clinicalItem}>
                    <Text style={pdfStyles.clinicalNumber}>{i + 1}.</Text>
                    <Text style={pdfStyles.clinicalText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}
        <Footer />
      </Page>

      {/* ========== PÁGINA DE CALENTAMIENTO ========== */}
      {((plan?.warmupUpper?.length || 0) + (plan?.warmupLower?.length || 0) > 0) && (
        <Page key="warmup" size={[1080, 1920]} style={pdfStyles.page}>
          <LogoHeader />
          <Text style={pdfStyles.sectionTitle}>Calendario semanal</Text>

          <View style={pdfStyles.calendarRow}>
            {(plan?.calendar || []).map((day: any, idx: number) => {
              const isRest = (day.actividad || '').toLowerCase() === 'descanso';
              return (
                <View key={idx} style={pdfStyles.calendarCard}>
                  <View style={pdfStyles.calendarCardContent}>
                    <View style={pdfStyles.calendarDayPill}>
                      <Text style={pdfStyles.calendarDayPillText}>{day.dia || ''}</Text>
                    </View>
                    <View style={pdfStyles.calendarDivider} />
                    <Text style={pdfStyles.calendarActivity}>{isRest ? '—' : (day.actividad || '—')}</Text>
                    {(() => {
                      const act = (day.actividad || '').toLowerCase();
                      let typeLabel = '';
                      if (act.includes('lower') || act.includes('pierna')) typeLabel = 'Lower Body';
                      else if (act.includes('upper') || act.includes('espalda') || act.includes('brazo') || act.includes('pecho')) typeLabel = 'Upper Body';
                      else if (act.includes('cardio')) typeLabel = 'Cardio';
                      else if (act.includes('descanso')) typeLabel = 'Descanso';
                      if (!typeLabel) return null;
                      return (
                        <View style={pdfStyles.calendarTypeBadge}>
                          <Text style={pdfStyles.calendarTypeBadgeText}>{typeLabel}</Text>
                        </View>
                      );
                    })()}
                    {(() => {
                      const dur = day.duracion || day.duration || day.tiempo || '';
                      if (!dur) return null;
                      return <Text style={pdfStyles.calendarDuration}>{dur}</Text>;
                    })()}
                    <View style={{ marginTop: 6 }}>
                      <Text style={pdfStyles.calendarMeta}>Cardio: {(day.cardio || '0')} min</Text>
                      {day.pasos && <Text style={pdfStyles.calendarMeta}>Pasos: {day.pasos}</Text>}
                      {day.fc && <Text style={pdfStyles.calendarMeta}>FC: {day.fc} BPM</Text>}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ marginBottom: 32 }} />

          <Text style={pdfStyles.sectionTitle}>Calentamiento</Text>

          {(() => {
            const lowerGeneral = plan.warmupLower?.filter((f: any) => f.id === 'CG') || [];
            const upperGeneral = plan.warmupUpper?.filter((f: any) => f.id === 'CG') || [];
            const allGeneral = [...lowerGeneral, ...upperGeneral];

            if (allGeneral.length === 0) return null;

            return (
              <Card title="Calentamiento General" style={{ marginBottom: 24 }}>
                <View style={pdfStyles.exerciseTableHeader}>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSerie, { textAlign: 'center' }]}>Serie</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColVideo, { textAlign: 'center' }]}>VID</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColEjercicio]}>EJERCICIO</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSets, { textAlign: 'center' }]}>SETS</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColReps, { textAlign: 'center' }]}>REPS</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColTecnica, { textAlign: 'center' }]}>TÉCNICA</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColRir, { textAlign: 'center' }]}>RIR</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColDescanso, { textAlign: 'center' }]}>DESCANSO</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColNotas, { textAlign: 'center' }]}>NOTAS</Text>
                </View>
                {allGeneral.map((fase: any) =>
                  fase.bloques.map((bloque: any) => {
                    return <BloqueEjercicios key={bloque.letra} bloque={bloque} showHeader={false} blockLabel="" />;
                  })
                )}
              </Card>
            );
          })()}

          {plan.warmupLower?.filter((f: any) => f.id !== 'CG').length > 0 && (
            <Card title="Calentamiento Lower Body" style={{ marginBottom: 24 }}>
              <View style={pdfStyles.exerciseTableHeader}>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSerie, { textAlign: 'center' }]}>Serie</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColVideo, { textAlign: 'center' }]}>VID</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColEjercicio]}>EJERCICIO</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSets, { textAlign: 'center' }]}>SETS</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColReps, { textAlign: 'center' }]}>REPS</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColTecnica, { textAlign: 'center' }]}>TÉCNICA</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColRir, { textAlign: 'center' }]}>RIR</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColDescanso, { textAlign: 'center' }]}>DESCANSO</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColNotas, { textAlign: 'center' }]}>NOTAS</Text>
              </View>
              {plan.warmupLower.filter((f: any) => f.id !== 'CG').map((fase: any) => (
                fase.bloques.map((bloque: any) => {
                  const warmupLabel = fase.id === 'ED' ? 'C. Movilidad' : fase.id === 'CE' ? 'C. Específico' : '';
                  return <BloqueEjercicios key={bloque.letra} bloque={bloque} showHeader={false} blockLabel={warmupLabel} />;
                })
              ))}
            </Card>
          )}

          {plan.warmupUpper?.filter((f: any) => f.id !== 'CG').length > 0 && (
            <Card title="Calentamiento Upper Body" style={{ marginBottom: 24 }}>
              <View style={pdfStyles.exerciseTableHeader}>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSerie, { textAlign: 'center' }]}>Serie</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColVideo, { textAlign: 'center' }]}>VID</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColEjercicio]}>EJERCICIO</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSets, { textAlign: 'center' }]}>SETS</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColReps, { textAlign: 'center' }]}>REPS</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColTecnica, { textAlign: 'center' }]}>TÉCNICA</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColRir, { textAlign: 'center' }]}>RIR</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColDescanso, { textAlign: 'center' }]}>DESCANSO</Text>
                <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColNotas, { textAlign: 'center' }]}>NOTAS</Text>
              </View>
              {plan.warmupUpper.filter((f: any) => f.id !== 'CG').map((fase: any) => (
                fase.bloques.map((bloque: any) => {
                  const warmupLabel = fase.id === 'ED' ? 'C. Movilidad' : fase.id === 'CE' ? 'C. Específico' : '';
                  return <BloqueEjercicios key={bloque.letra} bloque={bloque} showHeader={false} blockLabel={warmupLabel} />;
                })
              ))}
            </Card>
          )}
          <Footer />
        </Page>
      )}

      {/* ========== PÁGINAS DE ENTRENAMIENTO POR DÍA ========== */}
      {DAYS.map((day) => {
        const dayRoutine = routines[day.key];
        if (!dayRoutine || dayRoutine.tipo === 'rest') return null;
        const daySupps = supplements[day.key] || [];

        return (
          <Page key={day.key} size={[1080, 1920]} style={pdfStyles.page}>
            <LogoHeader />
            <Text style={pdfStyles.dayLabel}>Tratamiento Deportivo{day.full ? `\n${day.full}` : ''}</Text>

            {dayRoutine.fases?.filter((f) => f.grupo === 'main').length > 0 && (
              <Card title={dayRoutine.actividad || 'Rutina del día'}>
                <View style={pdfStyles.exerciseTableHeader}>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSerie, { textAlign: 'center' }]}>Serie</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColVideo, { textAlign: 'center' }]}>VID</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColEjercicio]}>EJERCICIO</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColSets, { textAlign: 'center' }]}>SETS</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColReps, { textAlign: 'center' }]}>REPS</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColTecnica, { textAlign: 'center' }]}>TÉCNICA</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColRir, { textAlign: 'center' }]}>RIR</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColDescanso, { textAlign: 'center' }]}>DESCANSO</Text>
                  <Text style={[pdfStyles.exerciseTableHeaderCell, pdfStyles.exerciseTableColNotas, { textAlign: 'center' }]}>NOTAS</Text>
                </View>
                {dayRoutine.fases.filter((f) => f.grupo === 'main').map((fase) => (
                  <View key={fase.id} style={{ marginBottom: 16 }}>
                    {fase.bloques.map((bloque: any) => {
                      const blockLabel = bloque.tipo === 'BISERIE' ? 'Biserie' : bloque.tipo === 'TRISERIE' ? 'Triserie' : bloque.tipo === 'SERIES DE APROXIMACIÓN' ? 'Aproximación' : bloque.tipo === 'ENTRENAMIENTO PRINCIPAL' ? 'Entrenamiento' : 'Serie Simple';
                      return <BloqueEjercicios key={bloque.letra} bloque={bloque} showHeader={false} blockLabel={blockLabel} />;
                    })}
                  </View>
                ))}
              </Card>
            )}
            <Footer />
          </Page>
        );
      })}

      {/* ========== PÁGINA DE NUTRICIÓN COMPLETA ========== */}
      <Page key="nutrition" size={[1080, 1920]} style={pdfStyles.page}>
        <LogoHeader />
        <Text style={pdfStyles.sectionTitle}>Tratamiento Nutricional</Text>

        {(() => {
          const mealOrder = ['DESAYUNO', 'COMIDA', 'CENA', 'SNACK', 'PRE', 'POST', 'AYUNAS', 'ANTES DORMIR'];
          const sortedMeals = [...meals].sort((a, b) => {
            const idxA = mealOrder.indexOf((a.time || '').toUpperCase());
            const idxB = mealOrder.indexOf((b.time || '').toUpperCase());
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
          });

          return sortedMeals.map((meal: any, i: number) => {
            const menuLabel = meal.menuType === 'armar' ? 'Armar menú' : 'Menú fijo';
            const macrosText = `${meal.macros?.proteinas || 0}P ${meal.macros?.carbos || 0}C ${meal.macros?.grasas || 0}G`;

            let foodRows: { grams: string; unit: string; name: string; isCategory: boolean }[] = [];

            if (meal.menuType === 'armar' && meal.foods?.length) {
              const cats: Record<string, any[]> = {};
              const catOrder = ['PROTEÍNA', 'CARBOHIDRATO', 'GRASA', 'OTROS'];
              meal.foods.forEach((f: any) => {
                const cat = inferCategoria(f);
                if (!cats[cat]) cats[cat] = [];
                cats[cat].push(f);
              });

              const sortedCats = catOrder.filter(c => cats[c]?.length);
              sortedCats.forEach(cat => {
                const cfg = CATEGORIA_CONFIG[cat];
                if (cats[cat].length > 0) {
                  foodRows.push({ grams: '', unit: '', name: cfg.label, isCategory: true });
                }
                cats[cat].forEach((f: any) => {
                  foodRows.push({
                    grams: String(f.grams || ''),
                    unit: String(f.unit || ''),
                    name: f.name || '',
                    isCategory: false
                  });
                });
              });
            } else if (meal.menuType === 'fijo') {
              if (meal.menus?.length) {
                meal.menus.forEach((menu: any) => {
                  if (menu.nombre) {
                    foodRows.push({ grams: '', unit: '', name: menu.nombre, isCategory: true });
                  }
                  menu.alimentos?.forEach((f: any) => {
                    foodRows.push({
                      grams: String(f.grams || ''),
                      unit: String(f.unit || ''),
                      name: f.name || '',
                      isCategory: false
                    });
                  });
                });
              } else if (meal.foods?.length) {
                meal.foods.forEach((f: any) => {
                  foodRows.push({
                    grams: String(f.grams || ''),
                    unit: String(f.unit || ''),
                    name: f.name || '',
                    isCategory: false
                  });
                });
              }
            }

            return (
              <View key={i} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                padding: 14,
                gap: 10,
                marginBottom: 12
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <View style={{
                    backgroundColor: '#16A34A',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>
                      {meal.hour || meal.tiempo || ''}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: 700, color: '#0D2640' }}>{meal.time || 'Comida'}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 10, fontWeight: 700, color: '#0D2640' }}>
                      {meal.kcal || 0} kcal
                    </Text>
                    <Text style={{ fontSize: 9, color: '#6B7280' }}>{macrosText}</Text>

                    <View style={{
                      backgroundColor: meal.menuType === 'armar' ? '#0B63CE' : '#16A34A',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999
                    }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 800, textTransform: 'uppercase' }}>
                        {menuLabel}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, gap: 3 }}>
                  <View style={pdfStyles.exerciseTableHeader}>
                    <Text style={[pdfStyles.exerciseTableHeaderCell, { width: 70, textAlign: 'right' }]}>GRAMOS</Text>
                    <Text style={[pdfStyles.exerciseTableHeaderCell, { width: 70, textAlign: 'center' }]}>PORCIÓN</Text>
                    <Text style={[pdfStyles.exerciseTableHeaderCell, { flex: 1 }]}>ALIMENTO</Text>
                  </View>

                  {foodRows.length === 0 ? (
                    <View style={[pdfStyles.exerciseTableRow, pdfStyles.exerciseTableRowLast]}>
                      <Text style={{ fontSize: 9, color: '#6B7280', width: 70, textAlign: 'right' }}>—</Text>
                      <Text style={{ fontSize: 9, color: '#6B7280', width: 70, textAlign: 'center' }}>—</Text>
                      <Text style={{ fontSize: 9, color: '#6B7280', flex: 1 }}>—</Text>
                    </View>
                  ) : (
                    foodRows.map((row, rowIdx) => {
                      const isLast = rowIdx === foodRows.length - 1;

                      if (row.isCategory) {
                        return (
                          <View key={rowIdx} style={pdfStyles.mealCategoryHeader}>
                            <Text style={pdfStyles.mealCategoryText}>
                              {row.name}
                            </Text>
                          </View>
                        );
                      }

                      return (
                        <View key={rowIdx} style={[
                          pdfStyles.exerciseTableRow,
                          isLast ? pdfStyles.exerciseTableRowLast : {}
                        ]}>
                          <Text style={{ fontSize: 9, color: '#6B7280', width: 70, textAlign: 'right' }}>
                            {row.grams}
                          </Text>
                          <Text style={{ fontSize: 9, color: '#6B7280', width: 70, textAlign: 'center' }}>
                            {row.unit}
                          </Text>
                          <Text style={{
                            fontSize: 9,
                            fontWeight: 400,
                            color: '#374151',
                            flex: 1
                          }}>
                            {row.name}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            );
          });
        })()}
        <Footer />
      </Page>

      {/* ========== PÁGINA DE SUPLEMENTACIÓN ========== */}
      {(() => {
        const allSupps = Array.isArray(supplements) ? supplements : [];
        if (allSupps.length === 0) return null;

        const grouped = allSupps.reduce((acc: Record<string, any[]>, s: any) => {
          const key = s.hora || s.horario || 'OTRO';
          if (!acc[key]) acc[key] = [];
          acc[key].push(s);
          return acc;
        }, {});

        const groupKeys = Object.keys(grouped);

        return (
          <Page key="supplements" size={[1080, 1920]} style={pdfStyles.page}>
            <LogoHeader />
            <Text style={pdfStyles.sectionTitle}>Suplementación</Text>

            <View style={pdfStyles.nutritionTableContainer}>
              <View style={pdfStyles.supplementTableHeader}>
                <Text style={[pdfStyles.supplementTableHeaderCell, pdfStyles.supplementTableColHora, { textAlign: 'center' }]}>HORA</Text>
                <Text style={[pdfStyles.supplementTableHeaderCell, pdfStyles.supplementTableColTiempo, { textAlign: 'center' }]}>TIEMPO DE COMIDA</Text>
                <Text style={[pdfStyles.supplementTableHeaderCell, pdfStyles.supplementTableColNombre, { textAlign: 'left' }]}>SUPLEMENTO</Text>
                <Text style={[pdfStyles.supplementTableHeaderCell, pdfStyles.supplementTableColLink, { textAlign: 'center' }]}>LINK</Text>
              </View>

              {groupKeys.map((key, gIdx) => {
                const items = grouped[key];
                const first = items[0];
                const tiempo = first.tiempo || '';

                return (
                  <View key={key} style={{ marginBottom: 16 }}>
                    <View style={pdfStyles.mealCategoryHeader}>
                      <Text style={pdfStyles.mealCategoryText}>{key}</Text>
                    </View>

                    {items.map((s: any, i: number) => {
                      const isLast = i === items.length - 1 && gIdx === groupKeys.length - 1;
                      return (
                        <View key={i} style={[
                          pdfStyles.supplementTableRow,
                          isLast ? pdfStyles.supplementTableRowLast : {}
                        ]}>
                          <View style={pdfStyles.supplementTableColHora}>
                            <View style={{ backgroundColor: '#16A34A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start' }}>
                              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{s.hora || s.horario || ''}</Text>
                            </View>
                          </View>
                          <View style={pdfStyles.supplementTableColTiempo}>
                            <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center' }}>{tiempo}</Text>
                          </View>
                          <View style={pdfStyles.supplementTableColNombre}>
                            <Text style={{ fontSize: 12, fontWeight: 700, color: '#0D2640' }}>{s.nombre}</Text>
                            <Text style={{ fontSize: 10, color: '#6B7280' }}>{s.dosis}</Text>
                            {(s.frecuencia || s.tomarCon || s.notas) && (
                              <Text style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>
                                {[s.frecuencia, s.tomarCon, s.notas].filter(Boolean).join(' • ')}
                              </Text>
                            )}
                          </View>
                          <View style={pdfStyles.supplementTableColLink}>
                            <Text style={{ fontSize: 10, color: C.primary, textAlign: 'center' }}>Comprar</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
            <Footer />
          </Page>
        );
      })()}

      {/* ========== PÁGINA DE GUÍA ========== */}
      {guideSections.length > 0 && (
        <Page key="guide" size={[1080, 1920]} style={pdfStyles.page}>
          <LogoHeader />
          {guideSections.map((section, sIdx) => {
            const num = sIdx + 1;
            const badgeColor =
              section.type === 'faq' ? C.primary :
                section.type === 'split' ? C.green :
                  section.type === 'grid' ? C.green :
                    section.type === 'columns' ? C.primary :
                      C.deep;

            if (section.type === 'faq') {
              return (
                <View key={section.id} style={pdfStyles.editorialSection}>
                  <View style={pdfStyles.editorialSectionHeader}>
                    <View style={[pdfStyles.editorialBadge, { backgroundColor: badgeColor }]}>
                      <Text style={pdfStyles.editorialBadgeText}>{num}</Text>
                    </View>
                    <Text style={pdfStyles.editorialSectionTitle}>{section.title}</Text>
                  </View>
                  {(section.items || []).map((f, i) => (
                    <View key={i} style={pdfStyles.editorialFaqItem}>
                      <Text style={pdfStyles.editorialFaqQuestion}>{f.q}</Text>
                      <Text style={pdfStyles.editorialFaqAnswer}>{f.a}</Text>
                    </View>
                  ))}
                </View>
              );
            }

            if (section.type === 'split') {
              return (
                <View key={section.id} style={pdfStyles.editorialSection}>
                  <View style={pdfStyles.editorialSectionHeader}>
                    <View style={[pdfStyles.editorialBadge, { backgroundColor: badgeColor }]}>
                      <Text style={pdfStyles.editorialBadgeText}>{num}</Text>
                    </View>
                    <Text style={pdfStyles.editorialSectionTitle}>{section.title}</Text>
                  </View>
                  <View style={pdfStyles.editorialSplitRow}>
                    {(section.sides || []).map((side, idx) => {
                      const isRed = side.variant === 'red';
                      const isGreen = side.variant === 'green';
                      const sideBorderColor = isRed ? '#FECACA' : isGreen ? '#A7F3D0' : '#BFDBFE';
                      const sideBgColor = isRed ? '#FEF2F2' : isGreen ? '#ECFDF5' : '#F0F7FF';
                      const sideLabelColor = isRed ? '#DC2626' : isGreen ? '#059669' : '#0B63CE';
                      const bulletColor = isRed ? '#DC2626' : isGreen ? '#10B981' : '#0D2640';
                      return (
                        <View key={idx} style={[pdfStyles.editorialSplitCard, { backgroundColor: sideBgColor, borderColor: sideBorderColor }]}>
                          <Text style={[pdfStyles.editorialSplitLabel, { color: sideLabelColor }]}>{side.label}</Text>
                          <Text style={pdfStyles.editorialCardBody}>{side.body}</Text>
                          {side.dont?.map((d, i) => (
                            <View key={i} style={pdfStyles.editorialItemRow}>
                              <View style={[pdfStyles.editorialItemBullet, { backgroundColor: '#DC2626' }]} />
                              <Text style={pdfStyles.editorialItemText}>{d}</Text>
                            </View>
                          ))}
                          {side.swaps?.map((sw, i) => (
                            <View key={i} style={pdfStyles.editorialItemRow}>
                              <Text style={{ fontWeight: 800, color: C.deep, fontSize: 11, minWidth: 65 }}>{sw.label}</Text>
                              <Text style={pdfStyles.editorialItemText}>{sw.value}</Text>
                            </View>
                          ))}
                          {side.categories?.map((cat, catIdx) => (
                            <View key={catIdx} style={{ marginTop: 12 }}>
                              <Text style={{ fontSize: 11, fontWeight: 800, color: C.deep, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{cat.name}</Text>
                              {cat.items.map((item, itemIdx) => (
                                <View key={itemIdx} style={pdfStyles.editorialItemRow}>
                                  <View style={[pdfStyles.editorialItemBullet, { backgroundColor: sideLabelColor }]} />
                                  <Text style={pdfStyles.editorialItemText}>{String(item).replace(/^<b>[^<]*<\/b>\s*/, '')}</Text>
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            }

            if (section.type === 'grid') {
              return (
                <View key={section.id} style={pdfStyles.editorialSection}>
                  <View style={pdfStyles.editorialSectionHeader}>
                    <View style={[pdfStyles.editorialBadge, { backgroundColor: badgeColor }]}>
                      <Text style={pdfStyles.editorialBadgeText}>{num}</Text>
                    </View>
                    <Text style={pdfStyles.editorialSectionTitle}>{section.title}</Text>
                  </View>
                  {(section.blocks || []).map((block, idx) => (
                    <View key={idx} style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#6B7280', marginBottom: 10 }}>{block.title}</Text>
                      {block.highlight ? (
                        <View style={pdfStyles.editorialHighlightBox}>
                          <Text style={pdfStyles.editorialHighlightText}>{(block.items || []).join(', ')}</Text>
                        </View>
                      ) : (
                        <View style={pdfStyles.editorialChipRow}>
                          {(block.items || []).map((t, i) => (
                            <View key={i} style={pdfStyles.editorialChip}>
                              <Text style={pdfStyles.editorialChipText}>{t}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            }

            if (section.type === 'columns') {
              return (
                <View key={section.id} style={pdfStyles.editorialSection}>
                  <View style={pdfStyles.editorialSectionHeader}>
                    <View style={[pdfStyles.editorialBadge, { backgroundColor: badgeColor }]}>
                      <Text style={pdfStyles.editorialBadgeText}>{num}</Text>
                    </View>
                    <Text style={pdfStyles.editorialSectionTitle}>{section.title}</Text>
                  </View>
                  <View style={pdfStyles.editorialSplitRow}>
                    {(section.columns || []).map((col, idx) => (
                      <View key={idx} style={pdfStyles.editorialSplitCard}>
                        <Text style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#0D2640', marginBottom: 10 }}>{col.title}</Text>
                        <Text style={pdfStyles.editorialCardBody}>{col.body}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            }

            return null;
          })}
          <Footer />
        </Page>
      )}

      {/* ========== PÁGINA DE GLOSARIO ========== */}
      {glossaryTerms.length > 0 && (
        <Page key="glossary" size={[1080, 1920]} style={pdfStyles.page}>
          <LogoHeader />
          <Text style={pdfStyles.sectionTitle}>Glosario</Text>
          {(() => {
            const grouped = glossaryTerms.reduce((acc, term) => {
              const cat = term.cat || 'General';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(term);
              return acc;
            }, {});

            return Object.entries(grouped).map(([cat, terms]) => (
              <View key={cat} style={pdfStyles.editorialSection}>
                <View style={pdfStyles.editorialSectionHeader}>
                  <View style={[pdfStyles.editorialBadge, { backgroundColor: C.deep }]}>
                    <Text style={pdfStyles.editorialBadgeText}>{terms.length}</Text>
                  </View>
                  <Text style={pdfStyles.editorialSectionTitle}>{cat}</Text>
                </View>
                <View style={{ gap: 10 }}>
                  {terms.map((term, tIdx) => (
                    <View key={term.term || tIdx} style={pdfStyles.editorialCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <View style={{ backgroundColor: C.deep, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                          <Text style={{ color: C.white, fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>{(term.term || '').slice(0, 2).toUpperCase()}</Text>
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: C.deep }}>{term.term}</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 'auto' }}>{term.subtitle}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, marginBottom: 6 }}>{term.def}</Text>
                      {term.body && (
                        <Text style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5, marginBottom: 6 }}>{term.body}</Text>
                      )}
                      {term.example && (
                        <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 9, fontWeight: 800, color: C.deep, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ejemplo</Text>
                          <Text style={{ fontSize: 11, color: '#374151' }}>{term.example}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ));
          })()}
          <Footer />
        </Page>
      )}
    </Document>
  );
}

export default PatientPDF;