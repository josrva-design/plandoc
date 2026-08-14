import type { ClientPlan } from "../core/types.ts";
import { guideSections, glossaryTerms } from '../data/guideContent.ts';
import { getDayType } from '../utils/dayType.ts';
import { exerciseDatabase } from '../data/exerciseDatabase.ts';
import { getMealTotalKcal, getMealTotalMacros } from '../utils/nutritionHelpers.ts';
import { normalizeFood, normalizeMeal } from '../utils/normalizeEditorData.ts';

const COLORS = {
  navy: '#0D2640',
  blue: '#0066CC',
  green: '#2E9E70',
  gray: '#E8E8E8',
  white: '#FFFFFF',
  grayMedium: '#6B7280',
  light: '#F8F9FA',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  emerald500: '#10B981',
  emeraldLight: '#D1FAE5',
  emeraldDark: '#065F46',
  amberLight: '#FEF3C7',
  amberDark: '#92400E',
  bgBase: '#F6F6F5',
  grayLight: '#F3F4F6',
  textSecondary: '#4B5563',
};

export const generateDashboardFitnessHTML = (data: ClientPlan, mode = "todo") => {
  const person = data.person || {};
  const firstName = person.firstName || (person.nombre || '').trim().split(/\s+/)[0] || '';
  const lastName = person.lastName || (person.nombre || '').trim().split(/\s+/).slice(1).join(' ') || '';
  const nombre = person.nombre || `${firstName} ${lastName}`.trim() || 'Paciente';
  const routines = data.routines || {};
  const upper = data.warmupUpper || [];
  const lower = data.warmupLower || [];
  const calendar = data.calendar || [];
  const meals = data.meals || [];
  const supplements = data.supplements || [];
  const stats = data.stats || {};
  const avances = data.avances || {};
  const estadisticas = data.estadisticas || {};
  const tNutri = data.tratamientoNutricional || {};
  const tEntre = data.tratamientoEntrenamiento || {};
  const clinico = data.clinico || {};
  const habits = data.habits || {};
  const supplementsStrategy = data.supplementsStrategy || '';

  const esc = (str) => String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const normalizeFood = (f: any) => {
    const name = f.name || f.nombre || '';
    let grams = f.grams || f.gramos || '';
    let unit = f.unit || 'g';
    let cantidadNum = 0;

    const gramsStr = String(grams || '').trim();
    const gramsMatch = gramsStr.match(/^(\d+(?:[.,]\d+)?)\s*([gG])?$/);
    let gramsNum = gramsStr;
    let gramsHasG = false;
    if (gramsMatch) {
      gramsNum = gramsMatch[1].replace(',', '.');
      gramsHasG = !!gramsMatch[2];
    }

    const porcionRaw = String(f.porcion || '').trim();
    if (porcionRaw) {
      const numMatch = porcionRaw.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
      if (numMatch) {
        const num = numMatch[1].replace(',', '.');
        const rest = numMatch[2].trim();
        cantidadNum = parseFloat(num);
        if (rest) unit = rest;
        else if (!gramsNum) gramsNum = num;
      } else {
        unit = porcionRaw;
      }
    }

    if (unit === 'g' && gramsHasG) {
      unit = '';
    }

    const parseNum = (v: any) => {
      if (typeof v === 'number') return v;
      const n = parseFloat(String(v).replace(',', '.'));
      return Number.isFinite(n) ? n : 0;
    };

    const p = parseNum(f.macros?.proteinas ?? f.p);
    const c = parseNum(f.macros?.carbos ?? f.c);
    const g = parseNum(f.macros?.grasas ?? f.g);
    const kcal = parseNum(f.kcal);

    return {
      name,
      grams: gramsNum,
      unit,
      cantidad: cantidadNum || parseFloat(String(f.cantidad || '').replace(',', '.')) || 0,
      kcal,
      macros: { proteinas: p, carbos: c, grasas: g },
      grupo: f.grupo || '',
      porcion: f.porcion || '',
    };
  };

  const normalizeMeal = (meal: any) => {
    if (!meal || typeof meal !== 'object') return meal;
    const normalized = { ...meal };
    if (Array.isArray(normalized.foods)) {
      normalized.foods = normalized.foods.map(normalizeFood);
    }
    if (Array.isArray(normalized.menus)) {
      normalized.menus = normalized.menus.map((menu: any) => ({
        ...menu,
        alimentos: (menu.alimentos || []).map(normalizeFood),
      }));
    }
    return normalized;
  };

  const habitEntries = Object.entries(habits).filter(([, v]) => v && String(v).toLowerCase() !== 'no').map(([k, v]) => `${esc(k)}: ${esc(String(v))}`);
  const habitHtml = habitEntries.length ? `<div style="padding-top:10px;margin-top:10px">
    <div style="font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;margin-bottom:6px">HÁBITOS</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${habitEntries.map(h => `<span style="font-size:9px;font-weight:700;padding:3px 10px;border-radius:999px;background:#F3F4F6;color:#374151">${h}</span>`).join('')}
    </div>
  </div>` : '';

  const supplementsStrategyHtml = supplementsStrategy ? `<div style="padding-top:10px;margin-top:10px">
    <div style="font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;margin-bottom:6px">SUPLEMENTACIÓN RECOMENDADA</div>
    <div style="font-size:11px;color:#4B5563">${esc(supplementsStrategy)}</div>
  </div>` : '';
  const diasStat = (() => {
    const calendar = data.calendar || [];
    const days = calendar.filter((day) => {
      const act = (day.actividad || '').toLowerCase();
      return act && act !== 'descanso';
    });
    return days.length;
  })();
  const cardioStat = (() => {
    const calendar = data.calendar || [];
    const days = calendar.filter((day) => {
      const act = (day.actividad || '').toLowerCase();
      return act && act !== 'descanso';
    });
    const cardioDays = days.filter((day) => (day.actividad || '').toLowerCase().includes('cardio'));
    return cardioDays.length;
  })();

  const groupExercisesBySequence = (exercises) => {
    if (!exercises.length) return [];

    const sorted = [...exercises].sort((a, b) => {
      const seqA = (a.secuencia || a.codigo || '').trim();
      const seqB = (b.secuencia || b.codigo || '').trim();
      const matchA = seqA.match(/^([A-Za-z])(\d+)$/);
      const matchB = seqB.match(/^([A-Za-z])(\d+)$/);

      if (!matchA && !matchB) return 0;
      if (!matchA) return -1;
      if (!matchB) return 1;

      const letterA = matchA[1].toUpperCase();
      const letterB = matchB[1].toUpperCase();
      const numA = parseInt(matchA[2], 10);
      const numB = parseInt(matchB[2], 10);

      if (letterA !== letterB) return letterA.localeCompare(letterB);
      return numA - numB;
    });

    const groups = new Map();
    sorted.forEach(ex => {
      const seq = (ex.secuencia || ex.codigo || '').trim();
      const match = seq.match(/^([A-Za-z])/);
      const letter = match ? match[1].toUpperCase() : 'Z';

      if (!groups.has(letter)) {
        groups.set(letter, []);
      }
      groups.get(letter).push(ex);
    });

    return Array.from(groups.entries()).map(([letter, exs]) => {
      const count = exs.length;
      const rawTipo = exs[0]?.tipo || '';
      const isKnown = ['SERIE SIMPLE', 'BISERIE', 'TRISERIE', 'SERIE GIGANTE / CIRCUITO'].includes(rawTipo);
      let tipo = rawTipo;
      if (!isKnown || !tipo) {
        tipo = 'SERIE SIMPLE';
        if (count === 2) tipo = 'BISERIE';
        else if (count === 3) tipo = 'TRISERIE';
        else if (count >= 4) tipo = 'SERIE GIGANTE / CIRCUITO';
      }

      return {
        letra: letter,
        tipo,
        ejercicios: exs,
        indicacion: exs[0]?.indicacion || '',
      };
    });
  };

  const bloqueColor = () => '#0D2640';

  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const logoHTML = `<img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTg2LjM5MyA1Mi4xNjE0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBpZD0iR3JvdXAgMyI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0xNTguNTUyIDQyLjQ2MjNDMTYzLjcyNCAzNy4xNTY5IDE2Ny44OTMgMzEuMjM4OCAxNzAuODM0IDI0Ljc0MjlDMTcxLjk4IDIyLjIxNzIgMTcyLjg0OCAxOS43MDY1IDE3Mi44OTcgMTYuOTkxNUMxNzIuOTI5IDE1LjIxODEgMTcyLjMyNCAxMy4yMzA1IDE3MC42MzggMTIuMjc0QzE2My43NjMgOC4zNTM1IDE1MS43MDQgNi42NDk4IDE0My42MzQgNS45MDI1N0MxMzUuMTI3IDUuMTE1NDggMTI2Ljc0NiA1LjAxNTg1IDExOC4xNDIgNS4wMjA4M0wxMjQuMzU3IDMuNTc2MTdDMTQ0LjY1NCAtMC43MDc5NzggMTY1Ljc3NiAtMS44Mjg4MyAxODUuODQ1IDQuMDY0MzdDMTg2Ljc3OCA0LjMzODM1IDE4Ni4yNzYgNS40NzQxNSAxODYuMTAxIDYuMDYxOThDMTgyLjA2MyAxOS40NTI0IDE3NC45MjEgMzIuMzc0NiAxNjMuNjcgNDEuOTQ0MkMxNTguODY4IDQ2LjA5MzkgMTUzLjUxNiA0OS42MzU4IDE0Ny4zNDQgNTIuMTYxNEMxNTEuMjk1IDQ5LjAyOCAxNTUuMDcxIDQ2LjAzNDEgMTU4LjU1NyA0Mi40NjIzSDE1OC41NTJaIiBmaWxsPSIjMDA2NkNDIi8+CjxwYXRoIGlkPSJWZWN0b3JfMiIgZD0iTTExMi4wODUgMzQuOTg1MkgxMDUuNzA3TDEwMy41OTUgMjEuOTg4M0wxMDAuMTUyIDM0Ljk4NTJIOTUuMjc0MkwxMDAuNzA5IDEzLjEzNkgxMDcuMDQ5TDEwOS4yNDggMjYuMTgyOEwxMTIuNjI2IDEzLjEzNkgxMTcuNTQyTDExMi4wODUgMzQuOTg1MloiIGZpbGw9IiMwMDY2Q0MiLz4KPHBhdGggaWQ9IlZlY3Rvcl8zIiBkPSJNMTguMjYyNiAxNC43OTQ5QzIxLjQxMDkgMTcuNTI5OCAxOC4zMTE3IDI2Ljc3MDYgMTYuODYwMyAyOS44NTkyQzE1LjQ0MTYgMzIuODgzIDEyLjU5MzQgMzQuOTQ1NCA4Ljk5NzYgMzQuOTg1MkgwTDUuNDQwMDMgMTMuMTM2SDEzLjQ5MzdDMTUuMzEwNyAxMy4xNTEgMTYuOTU4NSAxMy42OTQgMTguMjY4IDE0Ljc5NDlIMTguMjYyNlpNMTIuMDU4NiAyOC4xNTA1QzEzLjA3OSAyNS4zNTA5IDEzLjcwMSAyMi41NzYxIDE0LjE0ODQgMTkuNzE2N0MxNC4yNzM5IDE4LjkxNDcgMTQuMDMzOSAxNy44ODM1IDEzLjI5MTggMTcuNDg1QzEyLjI3MTQgMTYuOTM3IDExLjAwNTYgMTYuOTcxOSA5Ljg0ODggMTcuMTY2MUw2LjQ2NTgzIDMwLjk0NTJDOS4yNjQ5NyAzMS4xODQzIDExLjAzMjggMzAuOTY1MSAxMi4wNTg2IDI4LjE1MDVaIiBmaWxsPSIjMDA2NkNDIi8+CjxwYXRoIGlkPSJWZWN0b3JfNCIgZD0iTTMyLjE1NDYgMzMuOTgzNkMzMC4wMzIgMzUuMzgzNCAyNy41OTMgMzUuNDczMSAyNS4xNDMxIDM1LjM1ODVDMjEuODQ3NCAzNS4yMDQxIDE5Ljc3OTUgMzMuMDU3IDE5Ljk3NTkgMjkuOTYzNEMyMC4yMTYgMjYuMTYyNSAyMS4xMzgxIDIyLjMzNjcgMjIuNTM0OSAxOC42OTUxQzI0LjQwMSAxMy44MjgxIDI5LjI0MDkgMTEuOTY1IDM0LjQ1MTcgMTMuMDc1OUMzNi44NDE2IDEzLjU4NCAzOC40MTMxIDE1LjM0MjUgMzguMzU4NSAxNy43MTg3QzM4LjI3NjcgMjEuMzgwMiAzNy4yNTYzIDI1LjAzMTcgMzYuMDc3NyAyOC41ODM1QzM1LjM2MjkgMzAuNzMwNiAzNC4xODQ0IDMyLjY0ODUgMzIuMTYgMzMuOTgzNkgzMi4xNTQ2Wk0yNy45Njk1IDMxLjUzMjZDMjkuMjEzNiAzMS4yMjg4IDMwLjAzNzUgMzAuMjQyNCAzMC40MTQgMjkuMTM2NUMzMS41NzA3IDI1Ljc0OSAzMi4zNjc0IDIyLjMzMTcgMzIuOTIzOSAxOC44MTQ3QzMzLjAzMzEgMTguMTE3MyAzMi43MzI5IDE3LjIyNTYgMzIuMTQzNyAxNi44NzE5QzMxLjM1MjUgMTYuMzk4NiAzMC4zNTQgMTYuNTE4MiAyOS40OTE4IDE2LjkxNjdDMjguOTA4IDE3LjE4NTcgMjguMjgwNSAxNy45NzI4IDI3Ljk5MTMgMTguNzU0OUMyNi43MTQ1IDIyLjIyMjEgMjUuOTEyNCAyNS44Mjg3IDI1LjMzOTUgMjkuNDcwM0MyNS4yNDEzIDMwLjA5NzkgMjUuNjIzMyAzMC45MDUgMjYuMDMyNSAzMS4yMTM4QzI2LjUwMTcgMzEuNTY3NSAyNy4yNjAyIDMxLjcwMiAyNy45NzUgMzEuNTI3N0wyNy45Njk1IDMxLjUzMjZaIiBmaWxsPSIjMDA2NkNDIi8+CjxwYXRoIGlkPSJWZWN0b3JfNSIgZD0iTTE0NS45MSAyOS4yNzEyQzE0NS4yNjYgMzEuODIxNyAxNDMuNjU2IDMzLjg0OTIgMTQwLjkyMiAzNC43NjA5QzEzOC41NDMgMzUuNTQ4IDEzNS44MDQgMzUuNjU3NSAxMzMuNDE0IDM0LjkwMDNDMTI5Ljc0OCAzMy43Mzk2IDEzMC4wMjYgMzAuNTM2NSAxMzAuODcyIDI3LjY1NzFMMTM2LjA3MiAyNy42NzIxQzEzNS45NzkgMjguNzQzMSAxMzUuMzY4IDMwLjA1ODMgMTM2LjIwMyAzMC45NEMxMzcuMjk5IDMyLjEwMDcgMTM5LjQ3NiAzMS40MTgyIDE0MC4yMDggMzAuMjUyNUMxNDEuMDkyIDI4Ljg0NzcgMTQwLjU5NSAyNy40MzMgMTM5LjA4NCAyNi41MzEzTDEzNS40NDQgMjQuMzU5M0MxMzMuNjk4IDIzLjMxODIgMTMyLjkwMSAyMS42Mzk0IDEzMy4wNTQgMTkuNzc2M0MxMzMuMjc4IDE3LjA2NjMgMTM0LjkxNSAxNC43NTk5IDEzNy42NTkgMTMuNjI0MUMxMzkuNzYgMTIuNzU3MyAxNDIuMTU2IDEyLjU2OCAxNDQuNDA0IDEzLjAyMTNDMTQ2LjU0OCAxMy40NTQ3IDE0OC4wODEgMTQuOTA5MyAxNDguMjEyIDE2LjkxNjlDMTQ4LjI3MiAxNy44MjM1IDE0OC4xMTQgMTguNzI1MiAxNDcuODkgMTkuNjY2N0gxNDIuNDU2QzE0Mi42NTcgMTguNzk5OSAxNDMuMDk0IDE3Ljg3ODMgMTQyLjQ5OSAxNy4xMzExQzE0MS45MjYgMTYuNDA4OCAxNDAuNjcxIDE2LjUwMzQgMTM5LjgyNiAxNi44OTJDMTM5LjAyOSAxNy4yNTU2IDEzOC42MDMgMTguMDU3NyAxMzguNTY1IDE4Ljk2NDNDMTM4LjUyNyAyMC4wMDA1IDEzOS4wMTMgMjAuNzU3NyAxMzkuOTk1IDIxLjI5NTdDMTQzLjUzNiAyMy4yNDg1IDE0Ny4wMjggMjQuODQyNiAxNDUuOTEgMjkuMjc2MlYyOS4yNzEyWiIgZmlsbD0iIzAwNjZDQyIvPgo8cGF0aCBpZD0iVmVjdG9yXzYiIGQ9Ik0xNTcuNDQ1IDM0Ljc0MDVDMTU1LjEwOSAzNS41Mzc1IDE1Mi41MTcgMzUuNjIyMiAxNTAuMTg4IDM0Ljk5OTVDMTQ2LjM3OSAzMy45ODMzIDE0Ni40MTIgMzAuNjQwNiAxNDcuMzM5IDI3LjY0NjdIMTUyLjU0NUMxNTIuMzE2IDI4Ljc0NzYgMTUxLjgxNCAzMC44OTQ3IDE1My4yMDUgMzEuMzM4MUMxNTQuNDk4IDMxLjc1MTUgMTU1LjkxMSAzMS4zODc5IDE1Ni41ODggMzAuMzkxNkMxNTkuNTEzIDI2LjA4MjUgMTUwLjg5MSAyNS44Mzg0IDE0OS43NzMgMjEuNzM4NkMxNDguNzAzIDE3LjgzMyAxNTEuNDc1IDE0LjAyNzEgMTU1LjcyIDEzLjExNTVDMTU3LjY4NSAxMi42OTIgMTU5LjYzMyAxMi42MDczIDE2MS41MzcgMTMuMjA1MUMxNjQuNzM0IDE0LjIwNjQgMTY1LjE1NCAxNi45NTYzIDE2NC40MTIgMTkuNjcxMkwxNTguOTI5IDE5LjY0NjNDMTU5LjE1MiAxOC43NzQ1IDE1OS42NzEgMTcuNTk4OSAxNTguODUyIDE2Ljk5MTFDMTU3LjY3OSAxNi4xMjQzIDE1NS45IDE2LjcyMjEgMTU1LjI4OSAxNy44NDhDMTU0LjY3MyAxOC45OTM3IDE1NC45MDIgMjAuMzY4NiAxNTYuMTk1IDIxLjEzMDhMMTYwLjA5MSAyMy40MjczQzE2Mi40ODYgMjQuODQyMSAxNjMuMTAzIDI3LjI1MzIgMTYyLjMyOCAyOS42NzQyQzE2MS41ODYgMzEuOTgwNyAxNjAuMDg1IDMzLjgzMzggMTU3LjQ1IDM0LjczNTVMMTU3LjQ0NSAzNC43NDA1WiIgZmlsbD0iIzAwNjZDQyIvPgo8cGF0aCBpZD0iVmVjdG9yXzciIGQ9Ik00NC41Nzg3IDMxLjE0OTRDNDUuOTU5MiAzMi4xODA1IDQ3Ljc5MjYgMzEuMzk4NCA0OC40OTEgMzAuMTEzMkM0OS4wOTY2IDI5LjAwMjMgNDkuMzMxMyAyNy45MjEzIDQ5LjU4MjMgMjYuNjUxSDU1LjAyMjNDNTQuMTA1NiAzMS4xMTk1IDUxLjU5NTcgMzUuMTY0NSA0Ni4wNDEgMzUuMzYzOEM0NC43MjA2IDM1LjQxMzYgNDMuNDM4MyAzNS4zOTg2IDQyLjE3NzkgMzUuMDk0OEMzNy4zOTgxIDMzLjk0NCAzOC40Njc2IDI4LjczMzMgMzkuMjI2IDI1LjMzMDlDMzkuNzcxNiAyMi44NzUgNDAuMzYwOSAyMC41MTg3IDQxLjM1OTUgMTguMjIyMkM0Mi44NzA5IDE0Ljc0MDEgNDYuMjgxMSAxMi42NTc4IDUwLjM5NTMgMTIuNzY3NEM1MS43NzU3IDEyLjgwMjIgNTMuMDkwNyAxMi45MTE4IDU0LjM1MTEgMTMuNTA5NkM1Ny4zMDMxIDE0LjkxOTQgNTYuOTEwMiAxOC4yMDcyIDU2LjI4MjcgMjAuNzc3N0w1MC44NyAyMC44Mzc1TDUxLjMyMjggMTguNDAxNUM1MS40MTU2IDE3LjkwMzQgNTEuMTQyOCAxNy4yMTA5IDUwLjc5MzYgMTYuOTIyQzUwLjM1MTYgMTYuNTUzNCA0OS42MzY4IDE2LjQ3MzcgNDguOTY1NyAxNi41NzMzQzQ3LjcxNjIgMTYuNzYyNiA0Ni45Njg2IDE3Ljc5ODggNDYuNTQ4NSAxOC45Mzk1QzQ1LjMzNzIgMjIuMjUyMyA0NC42Mzg4IDI1LjY1OTcgNDQuMDQ0IDI5LjE0MThDNDMuOTQwMyAyOS43Mzk2IDQ0LjA0NCAzMC43MzU5IDQ0LjU4NDIgMzEuMTM5NEw0NC41Nzg3IDMxLjE0OTRaIiBmaWxsPSIjMDA2NkNDIi8+CjxwYXRoIGlkPSJWZWN0b3JfOCIgZD0iTTEyOS4xOCAyNS43MDQ2SDEyMi41MzRMMTIxLjIyNSAzMS4wMDQ5TDEyOC42NDYgMzEuMDA5OUwxMjcuNTcxIDM0Ljk4NTJIMTE0Ljg0MUwxMjAuMjg2IDEzLjEzNkgxMzIuOTRMMTMxLjkzIDE3LjIzNTlMMTI0LjY0MSAxNy4yMTFMMTIzLjQ5NSAyMS44Nzg3SDEzMC4xOUwxMjkuMTggMjUuNzA0NloiIGZpbGw9IiMwMDY2Q0MiLz4KPHBhdGggaWQ9IlZlY3Rvcl85IiBkPSJNNzEuNjk3MiAyMS44Nzg3TDcwLjc0MjQgMjUuNzA0Nkg2My4xNTI1TDYwLjg1NTQgMzQuOTg1Mkg1NS40MjYzTDYwLjg2NjMgMTMuMTM2SDc0LjM2TDczLjMzOTYgMTcuMjE2SDY1LjI0MjNMNjQuMDk2NSAyMS44Nzg3SDcxLjY5NzJaIiBmaWxsPSIjMDA2NkNDIi8+CjxwYXRoIGlkPSJWZWN0b3JfMTAiIGQ9Ik04OC42MTczIDM0Ljk4NTJIODMuMTU1NEw4Ny42MTMzIDE3LjIxNkg4Mi45MTU0TDgzLjkzNTcgMTMuMTM2SDk4LjYyOThMOTcuNjE0OSAxNy4yMTZIOTIuOTg3OUw4OC42MTczIDM0Ljk4NTJaIiBmaWxsPSIjMDA2NkNDIi8+CjxwYXRoIGlkPSJWZWN0b3JfMTEiIGQ9Ik03Ni40MjIzIDM0Ljk4NTJINzAuOTk4Nkw3Ni40Mzg3IDEzLjEzNkg4MS44NTY5TDc2LjQyMjMgMzQuOTg1MloiIGZpbGw9IiMwMDY2Q0MiLz4KPC9nPgo8L3N2Zz4K" style="height:28px;width:auto;display:block">`;

  const parseDate = (value) => {
    if (!value) return null;
    const str = String(value).trim();
    if (!str) return null;
    const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      const d = new Date(str + 'T00:00:00');
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const dmy = str.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
    if (dmy) {
      let [, dd, mm, yyyy] = dmy;
      if (yyyy.length === 2) yyyy = '20' + yyyy;
      const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const fechaConsulta = parseDate(data.fechaConsulta);
  const consultaLabel = fechaConsulta ? fechaConsulta.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const prox = fechaConsulta ? new Date(fechaConsulta) : new Date();
  prox.setMonth(prox.getMonth() + 1);
  const proxima = prox.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const dayRoutine = routines.monday || { tipo: 'rest', actividad: '', fases: [] };
  const dayMeals = meals || [];
  const daySupps = supplements || [];

  const warmupList = (title, w, type) => {
    const all = [...(w || [])];
    if (!all.length) return '';

    const faseColor = (fase) => {
      if (fase === 'GENERAL' || fase === 'CG') return '#0D2640';
      if (fase === 'MOVILIDAD' || fase === 'ED') return '#2E9E70';
      if (fase === 'ESPECÍFICO' || fase === 'CE') return '#0B63CE';
      return '#0D2640';
    };

    const exercises = all.flatMap(fase => (fase.bloques || []).flatMap(bloque => (bloque.ejercicios || []).map((ej, idx) => ({
      ...ej,
      fase: fase.nombre || fase.fase || '',
      idx: idx + 1,
    }))));

    return `
      <div class="training-card">
        <div class="training-header">
          <span class="training-label">${esc(title)}</span>
        </div>
        <div class="training-title">${type === 'lower' ? 'Tren Inferior' : type === 'upper' ? 'Tren Superior' : 'Calentamiento'}</div>
        <div class="training-list">
          ${exercises.map((ej, i) => {
            const isLastEj = i === exercises.length - 1;
            return `
              <div style="display:flex;gap:10px;padding:10px 0;border-bottom:${!isLastEj ? '1px solid rgba(0,0,0,0.04)' : 'none'}">
                <div style="width:16px;height:16px;border-radius:999px;background:#0D2640;color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;flex-shrink:0">${i + 1}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                    <span style="font-size:10px;font-weight:700;line-height:1.3;color:#0D2640">${esc(ej.nombre || '')}</span>
                  </div>
                <div style="font-size:9px;color:#6B7280;margin-top:1px">${esc(ej.prescripcion || ej.codigo || '')}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  const suppCard = () => {
    if (!daySupps.length) return '<div class="section-card" style="text-align:center;padding:20px;color:#6B7280;font-size:11px">Sin suplementos</div>';
    return `
      <div class="section-card">
        <div class="section-title">Suplementación</div>
        ${daySupps.map(s => `
          <div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid #F3F4F6">
            <span class="supp-pill">${esc(s.hora || s.horario || '')}</span>
            <div style="flex:1">
              <div style="font-size:11px;font-weight:700;color:#0D2640">${esc(s.nombre || s.suplemento || '')}</div>
              <div style="font-size:10px;color:#6B7280">${esc(s.dosis || '')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const avancesCard = () => {
    const pesoActual = avances.peso?.actual;
    const pesoAnterior = avances.peso?.anterior;
    const pesoDelta = avances.peso?.delta;

    const measures = [
      ['Abdomen', avances.abdomen?.actual, avances.abdomen?.anterior, avances.abdomen?.delta],
      ['Grasa kg', avances.grasaKg?.actual, avances.grasaKg?.anterior, avances.grasaKg?.delta],
      ['Grasa %', avances.grasaPct?.actual, avances.grasaPct?.anterior, avances.grasaPct?.delta],
      ['Pliegue', avances.pliegue?.actual, avances.pliegue?.anterior, avances.pliegue?.delta],
    ].filter(([, actual]) => actual);

    if (!pesoActual && !measures.length) return '<div style="text-align:center;padding:20px;color:#6B7280;font-size:11px">Sin datos de evolución</div>';

    const roundDelta = (d) => {
      const n = Number(d);
      if (!Number.isFinite(n)) return '0';
      return n.toFixed(1);
    };

    const miniCards = [
      { title: 'Nutrición', value: String(estadisticas.nutricion || 0), suffix: '%', pct: Number(estadisticas.nutricion || 0) },
      { title: 'Entreno', value: String(estadisticas.entrenamiento || 0), suffix: '%', pct: Number(estadisticas.entrenamiento || 0) },
      { title: 'Cardio', value: String(estadisticas.cardio || 0), suffix: '%', pct: Number(estadisticas.cardio || 0) },
      { title: 'Descanso', value: String(estadisticas.descanso || 0), suffix: '%', pct: Number(estadisticas.descanso || 0) },
    ];

     return `
       <div style="margin-bottom:16px">
         ${pesoActual ? `
           <div style="background:${COLORS.blue};border-radius:18px;padding:20px 16px 16px 16px;color:${COLORS.white};margin-bottom:12px;position:relative">
             <div style="font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;opacity:.7">${esc(avances.peso?.label || 'PESO')}</div>
             <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px">
               <span style="font-size:14px;font-weight:600;opacity:.5">${pesoAnterior || '—'}</span>
               <span style="font-size:24px;font-weight:900;line-height:1">${pesoActual}</span>
               <span style="font-size:12px;opacity:.6">kg</span>
             </div>
             <div style="font-size:8px;font-weight:700;letter-spacing:0.1em;opacity:.4;margin-top:6px;text-transform:uppercase">Anterior → Actual</div>
             ${pesoDelta ? (() => { const d = roundDelta(pesoDelta); const isPositive = Number(d) > 0; const arrow = isPositive ? '↑ +' : '↓ '; return `<div style="position:absolute;top:16px;right:16px;font-size:11px;font-weight:800;background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:999px">${esc(arrow + d)}</div>`; })() : ''}
           </div>
        ` : ''}

         ${measures.length > 0 ? `
           <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
             ${measures.map(([label, actual, anterior, delta]) => {
               const d = roundDelta(delta || (anterior ? Number(actual) - Number(anterior) : 0));
               const isPositive = Number(d) > 0;
               const arrow = isPositive ? '↑ +' : '↓ ';
               return `
                  <div style="background:#fff;border:1px solid ${COLORS.gray};border-radius:16px;padding:16px 12px 12px 12px;text-align:center;flex:1 1 calc(50% - 4px);min-width:140px;position:relative">
                     <span style="font-size:9px;letter-spacing:1px;color:${COLORS.grayMedium};font-weight:700;display:block">${esc(label)}</span>
                     ${anterior ? `<div style="position:absolute;top:10px;right:8px;font-size:8px;font-weight:800;color:${COLORS.green};padding:1px 6px;border-radius:9999px;background:rgba(46,158,112,0.08)">${esc(arrow + d)}</div>` : ''}
                    <div style="display:flex;align-items:baseline;justify-content:center;gap:4px;margin-top:4px">
                      <span style="font-size:12px;font-weight:700;color:#9CA3AF">${anterior || '—'}</span>
                      <span style="font-size:16px;font-weight:900;color:${COLORS.navy}">${esc(actual || '—')}</span>
                    </div>
                    <div style="font-size:8px;font-weight:700;letter-spacing:0.1em;opacity:.4;margin-top:2px;text-transform:uppercase">Anterior → Actual</div>
                  </div>
               `;
             }).join('')}
           </div>
         ` : ''}

         <div style="background:#2E9E70;border-radius:16px;padding:14px;color:#fff;margin-bottom:12px">
           <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
             <span style="font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;opacity:.8">Adherencia al plan</span>
             <span style="font-size:20px;font-weight:900;line-height:1">${estadisticas.adherencia || 0}%</span>
           </div>
           <div style="height:8px;background:rgba(255,255,255,0.2);border-radius:999px;overflow:hidden">
             <div style="height:100%;background:#fff;border-radius:999px;width:${estadisticas.adherencia || 0}%"></div>
           </div>
         </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
             ${miniCards.map(card => `
               <div style="background:#fff;border:1px solid ${COLORS.gray};border-radius:16px;padding:12px;text-align:center">
                <span style="font-size:9px;letter-spacing:1px;color:${COLORS.grayMedium};font-weight:700;display:block">${esc(card.title)}</span>
                <div style="display:flex;align-items:baseline;justify-content:center;gap:2px;margin-top:4px">
                  <span style="font-size:16px;font-weight:900;color:${COLORS.navy}">${card.value}</span>
                  <span style="font-size:11px;font-weight:800;color:${COLORS.grayMedium}">${card.suffix}</span>
                </div>
                <div style="height:6px;background:${COLORS.light};border-radius:999px;overflow:hidden;margin-top:8px">
                  <div style="height:100%;background:${COLORS.green};border-radius:999px;width:${Math.min(card.pct, 100)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
       </div>
    `;
  };

  const calentamientoHTML = () => {
    const generalFases = [...upper.filter(f => f.id === 'CG'), ...lower.filter(f => f.id === 'CG')];
    const upperFases = upper.filter(f => f.id !== 'CG');
    const lowerFases = lower.filter(f => f.id !== 'CG');

    const upperDays = calendar.filter(c => (c.actividad || '').includes('Upper')).map(c => c.dia);
    const lowerDays = calendar.filter(c => (c.actividad || '').includes('Lower')).map(c => c.dia);

    const hasGeneral = generalFases.length > 0;
    const hasUpper = upperFases.length > 0;
    const hasLower = lowerFases.length > 0;

    if (!hasGeneral && !hasUpper && !hasLower) return '';

    const faseColor = (id) => {
      if (id === 'CG') return '#0D2640';
      if (id === 'ED') return '#0D2640';
      if (id === 'CE') return '#0D2640';
      return '#0D2640';
    };

    const countEj = (fase) => (fase.bloques || []).flatMap(bloque => (bloque.ejercicios || [])).length;

    const renderFaseContent = (fase, isFirst) => {
      const ejercicios = (fase.bloques || []).flatMap(bloque => (bloque.ejercicios || []));
      if (!ejercicios.length) return '';
      const color = faseColor(fase.id);
      const isGeneral = fase.id === 'CG';
      const headerText = !isGeneral ? (`${esc(fase.nombre || fase.fase || '')}`).toUpperCase() : (isFirst ? 'OPCIONES DE CALENTAMIENTO • ELIGE <span style="display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;padding:1px 5px;border-radius:999px;background:#0D2640;color:#fff">1</span>' : '');
      return `
        ${headerText ? `<div style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6B7280;margin-bottom:6px">${headerText}</div>` : ''}
        ${ejercicios.map((ej, i) => {
          const isLastEj = i === ejercicios.length - 1;
          return `
              <div style="display:flex;gap:10px;padding:10px 0;border-bottom:${!isLastEj ? '1px solid rgba(0,0,0,0.04)' : 'none'}">
                 <div style="width:16px;height:16px;border-radius:999px;background:#0D2640;color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;flex-shrink:0">${esc(ej.codigo || String(i + 1))}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                    <span style="font-size:10px;font-weight:700;line-height:1.3;color:#0D2640">${esc(ej.nombre || '')}</span>
                  </div>
                  <div style="font-size:9px;color:#6B7280;margin-top:2px">${esc(ej.prescripcion || '')}</div>
                </div>
              </div>
          `;
        }).join('')}
      `;
    };

    return `
      <div style="margin-bottom:16px">
        ${hasGeneral ? `
          <details style="border:1px solid #E8E8E8;border-radius:12px;margin:0 0 10px 0;background:#fff">
              <summary style="padding:11px 12px;font-weight:700;font-size:13px;cursor:pointer;list-style:none;color:#0D2640;display:flex;align-items:center;justify-content:space-between">
                <div style="display:flex;flex-direction:column;flex:1">
                  <span>General</span>
                  <span style="font-size:8px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6B7280">TODOS LOS DÍAS DE ENTRENAMIENTO</span>
                </div>
                <span style="font-size:10px;color:#6B7280;font-weight:700">${generalFases.reduce((sum, f) => sum + countEj(f), 0)} ejercicios opcionales ▼</span>
          </summary>
          <div class="content" style="padding:10px 12px 12px 12px">
              ${generalFases.map((fase, idx) => renderFaseContent(fase, idx === 0)).join('')}
            </div>
          </details>
        ` : ''}

        ${hasUpper ? `
          <details style="border:1px solid #E8E8E8;border-radius:12px;margin:0 0 10px 0;background:#fff">
            <summary style="padding:11px 12px;font-weight:700;font-size:13px;cursor:pointer;list-style:none;color:#0D2640;display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;flex-direction:column;flex:1">
                <span>Upper Body</span>
                <span style="font-size:8px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6B7280">TREN SUPERIOR • ${upperDays.join(', ').toUpperCase() || 'DIAS DE ENTRENO'}</span>
              </div>
              <span style="font-size:10px;color:#6B7280;font-weight:700;margin-left:8px">${upperFases.reduce((sum, f) => sum + countEj(f), 0)} ejercicios ▼</span>
            </summary>
            <div class="content" style="padding:10px 12px 12px 12px">
              ${upperFases.map((fase, idx) => renderFaseContent(fase, idx === 0)).join('')}
            </div>
          </details>
        ` : ''}

        ${hasLower ? `
          <details style="border:1px solid #E8E8E8;border-radius:12px;margin:0 0 10px 0;background:#fff">
            <summary style="padding:11px 12px;font-weight:700;font-size:13px;cursor:pointer;list-style:none;color:#0D2640;display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;flex-direction:column;flex:1">
                <span>Lower Body</span>
                <span style="font-size:8px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6B7280">TREN INFERIOR • ${lowerDays.join(', ').toUpperCase() || 'DIAS DE ENTRENO'}</span>
              </div>
              <span style="font-size:10px;color:#6B7280;font-weight:700;margin-left:8px">${lowerFases.reduce((sum, f) => sum + countEj(f), 0)} ejercicios ▼</span>
            </summary>
            <div class="content" style="padding:10px 12px 12px 12px">
              ${lowerFases.map((fase, idx) => renderFaseContent(fase, idx === 0)).join('')}
            </div>
          </details>
        ` : ''}
      </div>
    `;
  };

  const guiaHTML = () => {
    if (!guideSections.length) return '';

    const fmt = (str) => {
      if (!str) return '';
      return String(str).replace(/\n/g, '<br>');
    };

    const badgeColor = (section) => {
      if (section.type === 'faq') return '#6B7280';
      if (section.type === 'split') return '#059669';
      if (section.type === 'grid') return '#059669';
      if (section.type === 'columns') return '#6B7280';
      return '#0D2640';
    };

    const sideBadge = (variant) => {
      if (variant === 'green') return 'background:#ECFDF5;color:#059669;border:1px solid #A7F3D0';
      if (variant === 'red') return 'background:#FEF2F2;color:#DC2626;border:1px solid #FECACA';
      return 'background:#F0F7FF;color:#0B63CE;border:1px solid #BFDBFE';
    };

    const renderSectionInner = (section) => {
      switch (section.type) {
        case 'split':
          return `
            <div style="display:flex;flex-direction:column;gap:12px">
              ${(section.sides || []).map(side => `
                <div>
                  <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:999px;display:inline-block;margin-bottom:6px;${sideBadge(side.variant)}">${esc(side.label || '')}</span>
                  <div style="font-size:12px;color:#4B5563;line-height:1.6">${fmt(side.body || '')}</div>
                  ${(side.dont || []).map(d => `
                    <div style="display:flex;align-items:center;gap:4px;margin-top:6px;font-size:12px;color:#DC2626"><span>✕</span> ${esc(d)}</div>
                  `).join('')}
                  ${(side.swaps || []).map(sw => `
                    <div style="display:flex;gap:4px;margin-top:6px;font-size:12px"><span style="font-weight:700;color:#0D2640;min-width:70px">${esc(sw.label || '')}</span><span style="color:#4B5563">${esc(sw.value || '')}</span></div>
                  `).join('')}
                  ${(side.categories || []).map(cat => `
                    <div style="margin-top:8px">
                      <div style="font-size:9px;font-weight:700;color:#6B7280;margin-bottom:4px">${esc(cat.name || '')}</div>
                      ${(cat.items || []).map(item => `
                        <div style="display:flex;align-items:flex-start;gap:4px;font-size:12px;color:#4B5563;line-height:1.6"><span style="color:#0D2640;margin-top:1px">•</span> ${fmt(String(item).replace(/^<b>[^<]*<\/b>\s*/, ''))}</div>
                      `).join('')}
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          `;
        case 'columns':
          return `
            <div style="display:flex;flex-direction:column;gap:8px">
              ${(section.columns || []).map(col => `
                <div>
                  <div style="font-size:11px;font-weight:700;color:#0D2640;margin-bottom:4px">${esc(col.title || '')}</div>
                  <div style="font-size:12px;color:#4B5563;line-height:1.6">${fmt(col.body || '')}</div>
                </div>
              `).join('')}
            </div>
          `;
        case 'grid':
          return `
            ${section.note ? `<span style="font-size:8px;font-weight:700;padding:2px 8px;border-radius:999px;background:#DCFCE7;color:#166534;border:1px solid #86EFAC;display:inline-block;margin-bottom:8px">${esc(section.note || '')}</span>` : ''}
            <div style="display:flex;flex-direction:column;gap:10px">
              ${(section.blocks || []).map(block => `
                <div>
                  <div style="font-size:11px;font-weight:700;color:#0D2640;margin-bottom:6px">${esc(block.title || '')}</div>
                  ${block.highlight
                    ? `<div style="background:#0D2640;border-radius:12px;padding:12px"><div style="font-size:11px;color:rgba(255,255,255,0.8);line-height:1.6">${fmt((block.items || []).join('; '))}</div></div>`
                    : `<div style="display:flex;flex-wrap:wrap;gap:4px">
                        ${(block.items || []).map(item => `
                          <span style="font-size:10px;color:#0D2640;background:#F3F4F6;border-radius:8px;padding:3px 6px">${esc(item)}</span>
                        `).join('')}
                      </div>`
                  }
                </div>
              `).join('')}
            </div>
          `;
        case 'faq':
          return `
            <div style="display:flex;flex-direction:column;gap:4px">
              ${(section.items || []).map((f, idx) => `
                <details style="border:1px solid #E8E8E8;border-radius:12px">
                  <summary style="padding:10px 14px;cursor:pointer;list-style:none;font-size:11px;font-weight:700;display:flex;justify-content:space-between;align-items:center;color:#0D2640">
                    <span style="flex:1">${esc(f.q || '')}</span>
                    <span style="font-size:9px;color:#6B7280;flex-shrink:0">▼</span>
                  </summary>
                  <div style="padding:12px 14px;border-top:1px solid #E8E8E8;font-size:12px;color:#4B5563;line-height:1.6">${fmt(f.a || '')}</div>
                </details>
              `).join('')}
            </div>
          `;
        default:
          return `<div style="font-size:12px;color:#4B5563;line-height:1.6">${fmt(section.contenido || section.body || '')}</div>`;
      }
    };

    return `
      <details class="guia-outer">
        <summary>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="display:flex;flex-direction:column">
              <span style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;opacity:.7">Contenido educativo</span>
              <span style="font-size:15px;font-weight:900">Guía DocFitness</span>
            </div>
          </div>
          <span style="font-size:9px;opacity:.6">Léelo ▼</span>
        </summary>
        <div class="guia-content">
          ${guideSections.map((section, i) => `
            <details class="guia-inner">
              <summary>
                <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;padding:8px 12px">
                  <span style="width:16px;height:16px;border-radius:999px;background:${badgeColor(section)};color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;flex-shrink:0">${i + 1}</span>
                  <span style="font-size:11px;font-weight:700;color:#0D2640;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(section.title || '')}</span>
                </div>
                <span style="font-size:10px;color:#6B7280;flex-shrink:0;padding:6px 8px">▼</span>
              </summary>
              <div class="guia-inner-content">
                ${renderSectionInner(section)}
              </div>
            </details>
          `).join('')}
        </div>
      </details>
    `;
  };

  const glosarioHTML = () => {
    if (!glossaryTerms.length) return '';

    const fmt = (str) => {
      if (!str) return '';
      return String(str).replace(/\n/g, '<br>');
    };

    const catColor = (cat) => {
      const map = {
        'Intensidad': '#059669',
        'Series': '#6B7280',
        'Notación': '#374151',
        'Nutrición': '#059669',
        'Composición corporal': '#6B7280',
        'Calentamiento': '#92400E',
        'Hábitos': '#92400E',
      };
      return map[cat] || '#0D2640';
    };

    const grouped = {};
    glossaryTerms.forEach(term => {
      const cat = term.cat || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(term);
    });

    const cats = ['Intensidad','Series','Notación','Calentamiento','Nutrición','Composición corporal','Hábitos'].filter(c => grouped[c]);

    return `
      <details class="guia-outer">
        <summary style="background:#F3F4F6;border-radius:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="display:flex;flex-direction:column">
              <span style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280">Términos clave</span>
              <span style="font-size:15px;font-weight:900;color:#0D2640">Glosario DocFitness</span>
            </div>
          </div>
          <span style="font-size:9px;opacity:.6">Léelo ▼</span>
        </summary>
        <div class="guia-content">
            ${cats.map(cat => `
              <div style="margin-bottom:10px">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px">
                  <span style="width:6px;height:6px;border-radius:999px;background:${catColor(cat)}"></span>
                  <span style="font-size:10px;font-weight:700;color:#0D2640">${esc(cat)}</span>
                </div>
                 <div style="display:flex;flex-direction:column;gap:3px">
                  ${grouped[cat].map(term => `
                 <details style="border-bottom:1px solid #E8E8E8">
                     <summary style="padding:5px 8px;cursor:pointer;list-style:none;font-size:10px;font-weight:700;display:flex;justify-content:space-between;align-items:center;color:#0D2640;background:#fff">
                       <div style="display:flex;align-items:center;gap:4px;flex:1;min-width:0">
                         <span style="font-size:6px;font-weight:800;padding:1px 4px;border-radius:999px;background:${catColor(cat)};color:#fff;white-space:nowrap;flex-shrink:0">
                           ${(() => { const m={'Intensidad':'INT','Series':'SER','Notación':'NOT','Calentamiento':'CAL','Nutrición':'NUT','Composición corporal':'COMP','Hábitos':'HAB'}; return m[cat] || cat.substring(0,3).toUpperCase(); })()}
                         </span>
                         <span style="font-size:9px;font-weight:700;color:#0D2640;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;min-width:0">${esc(term.title || '')}</span>
                         ${term.subtitle ? `<span style="font-size:7px;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;min-width:0">— ${esc(term.subtitle)}</span>` : ''}
                       </div>
                       <span style="font-size:9px;color:#6B7280;flex-shrink:0;padding:5px 6px">▼</span>
                     </summary>
                    <div style="padding:8px 10px;font-size:9px;color:#4B5563;line-height:1.4">
                      <div style="margin-bottom:${term.example ? '6px' : '0'}">${fmt(term.body || '')}</div>
                      ${term.example ? `<div style="display:flex;align-items:flex-start;gap:3px"><span style="color:#0D2640;margin-top:1px">•</span> <span style="font-weight:700">Ej:</span> ${fmt(term.example)}</div>` : ''}
                    </div>
                  </details>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </details>
      `;
  };

  const heroHTML = () => {
    return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px">
      <div style="flex:1;min-width:0">
        <div style="font-size:22px;font-weight:900;line-height:1.1;color:#0D2640">Hola,</div>
        <div style="font-size:22px;font-weight:900;line-height:1.1;color:#0D2640">${esc(firstName)}${lastName ? ' ' + esc(lastName) : ''}</div>
        ${consultaLabel ? `<div style="font-size:12px;font-weight:700;color:#0066CC;margin-top:4px">Consulta: ${consultaLabel}</div>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
          <span style="font-size:9px;font-weight:800;padding:4px 10px;border-radius:999px;background:#0066CC;color:#fff;text-transform:uppercase;letter-spacing:0.8px;white-space:nowrap">Actualización: ${proxima}</span>
        </div>
      </div>
    </div>
    `;
  };

  const calendarioHTML = () => {
    const days = [
      { label: 'LUN', key: 'monday', dia: 'LUNES' },
      { label: 'MAR', key: 'tuesday', dia: 'MARTES' },
      { label: 'MIE', key: 'wednesday', dia: 'MIÉRCOLES' },
      { label: 'JUE', key: 'thursday', dia: 'JUEVES' },
      { label: 'VIE', key: 'friday', dia: 'VIERNES' },
      { label: 'SAB', key: 'saturday', dia: 'SÁBADO' },
      { label: 'DOM', key: 'sunday', dia: 'DOMINGO' },
    ];
    const todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()];
    const calendarMap = Array.isArray(calendar) ? calendar.reduce((acc, c) => {
      if (c && typeof c === 'object') acc[c.dayKey || c.dia] = c;
      return acc;
    }, {}) : {};

  const dayDetails = (dayLabel, dayKey, dia) => {
    const calDay = calendarMap[dia];
    const r = routines[dayKey] || { actividad: '', fases: [] };
    const actividad = calDay?.actividad || r.actividad || '';
    const tipo = getDayType(actividad);
    const tipoLabel = tipo === 'lower' ? 'Lower' : tipo === 'upper' ? 'Upper' : tipo === 'rest' ? 'Descanso' : 'Full';
    const isToday = dayKey === todayKey;
    const ejercicios = (r.fases || [])
      .filter(fase => !['CG', 'ED', 'CE'].includes(fase.id))
      .flatMap(fase => (fase.bloques || []).flatMap(bloque => (bloque.ejercicios || []).map((ex, i) => ({
        ...ex,
        tipo: bloque.tipo || '',
        indicacion: bloque.indicacion || '',
        prescripcion: ex.prescripcion || '',
        grupo: fase.grupo,
        faseNombre: fase.nombre,
        faseId: fase.id,
      }))));
    const warmupList = (title, items, mode) => {
      const all = [...(items || [])];
      if (!all.length) return '';

      const exercises = all.map((ej, i) => {
        const isLastEj = i === all.length - 1;
        return `
          <div style="display:flex;gap:10px;padding:10px 0;border-bottom:${!isLastEj ? '1px solid rgba(0,0,0,0.04)' : 'none'}">
            <div style="width:16px;height:16px;border-radius:999px;background:#0D2640;color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;flex-shrink:0">${i + 1}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span style="font-size:10px;font-weight:700;line-height:1.3;color:#0D2640">${esc(ej.nombre || '')}</span>
              </div>
              <div style="font-size:9px;color:#6B7280;margin-top:1px">${esc(ej.prescripcion || ej.codigo || '')}</div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="training-card">
          <div class="training-header">
            <span class="training-label">${esc(title)}</span>
          </div>
          <div class="training-title">${mode === 'lower' ? 'Tren Inferior' : mode === 'upper' ? 'Tren Superior' : 'Calentamiento'}</div>
          <div class="training-list">
            ${exercises}
          </div>
        </div>
      `;
    };
    const warmupLower = r.fases.filter((f) => f.grupo === 'lower').flatMap((f) => (f.bloques || []).flatMap((b) => (b.ejercicios || []).map((ex) => ({ ...ex, grupo: 'lower' }))));
    const warmupUpper = r.fases.filter((f) => f.grupo === 'upper').flatMap((f) => (f.bloques || []).flatMap((b) => (b.ejercicios || []).map((ex) => ({ ...ex, grupo: 'upper' }))));
    const warmupHtml = isToday ? (warmupList('CALENTAMIENTO', [...warmupLower, ...warmupUpper], 'both') || '') : '';

    const renderEjercicioRow = (ex, exIdx, total) => {
      const seq = (ex.codigo || ex.secuencia || '').trim();
      const displayCode = seq || '—';
      const isLastEj = exIdx === total - 1;
      const s1 = ex.s1 || ex.semana1 || '';
      const s2 = ex.s2 || ex.semana2 || '';
      const s3 = ex.s3 || ex.semana3 || '';
      const s4 = ex.s4 || ex.semana4 || '';
      const reps = ex.reps || '';
      const descanso = ex.descanso || '';
      const isAprox = ex.faseId === 'SA' || (ex.categoria || '').toLowerCase() === 'aprox' || /\(\d+%\)/.test(ex.nombre || '');
      const tecnica = isAprox ? '' : (ex.tecnica || '');
      const rir = ex.rir || '';
      const infoLine = (reps || descanso || tecnica || rir) ? `<div style="font-size:9px;color:#6B7280;margin-top:1px">${reps ? `<b>${esc(reps)}</b> reps` : ''}${reps && (descanso || tecnica || rir) ? ' • ' : ''}${descanso ? `<b>${esc(descanso)}</b> descanso` : ''}${descanso && (tecnica || rir) ? ' • ' : ''}${tecnica ? `${esc(tecnica)}` : ''}${tecnica && rir ? ' • ' : ''}${rir ? `<b>${esc(rir)}</b>` : ''}</div>` : '';
      const pctMatch = (ex.nombre || '').match(/(\d+%)/);
      const cleanName = (ex.nombre || '').replace(/\s*\(\d+%\)\s*/, '').trim();
      const aproxPct = isAprox ? (pctMatch ? pctMatch[1].replace('%','') : (ex.porcentaje || ex.aproxPorcentaje || '')) : '';
      const aproxBadge = isAprox ? `<span style="font-size:8px;font-weight:700;color:#0D2640;background:#E5E7EB;padding:1px 6px;border-radius:999px;margin-right:4px">Aprox ${aproxPct}%</span>` : '';
      const db = exerciseDatabase.find((e) => e.nombre.toLowerCase() === (ex.nombre || '').toLowerCase());
      const noteLine = db?.nota ? `<div style="font-size:9px;color:#6B7280;margin-top:1px;font-style:italic">${esc(db.nota)}</div>` : '';
      const musculo = ex.musculo || '';
      const movimiento = ex.movimiento || '';
      const musculoMovimientoLine = (musculo || movimiento) ? `<div style="font-size:9px;color:#6B7280;margin-top:1px">${musculo ? `<b>${esc(musculo)}</b>` : ''}${musculo && movimiento ? ' · ' : ''}${movimiento ? `${esc(movimiento)}` : ''}</div>` : '';

      const formatSemanas = (s1, s2, s3, s4) => {
        const arr = [s1, s2, s3, s4].map(v => parseInt(v, 10) || 0);
        const todosIguales = arr.every(v => v === arr[0]);
        if (todosIguales) return `Sem 1-4: <b>${arr[0]} sets</b>`;
        return `Sem 1: <b>${s1} sets</b> • Sem 2: <b>${s2} sets</b> • Sem 3: <b>${s3} sets</b> • Sem 4: <b>${s4} sets</b>`;
      };

      const hasWeeks = isAprox ? false : (s1 || s2 || s3 || s4);
      const weeksLine = hasWeeks ? `<div style="font-size:9px;color:#6B7280;margin-top:1px">${formatSemanas(s1, s2, s3, s4)}</div>` : '';

      return `
        <div style="display:flex;align-items:flex-start;gap:6px;padding:4px 0;border-bottom:${!isLastEj ? '1px solid #F3F4F6' : 'none'}">
          <span style="width:16px;height:16px;border-radius:999px;background:#0D2640;color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;flex-shrink:0">${esc(displayCode)}</span>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
              ${aproxBadge}
              <span style="font-size:10px;font-weight:700;color:#0D2640;line-height:1.3">${esc(cleanName || '—')}</span>
            </div>
            ${musculoMovimientoLine}
            ${weeksLine}
            ${infoLine}
            ${noteLine}
          </div>
        </div>
      `;
    };

      const bloques = groupExercisesBySequence(ejercicios);

      return `
        <details id="dia-${dayKey}" class="day-details" style="border:1px solid #E8E8E8;border-radius:12px;margin:0 0 10px 0;background:#fff">
          <summary style="padding:11px 12px;font-weight:700;font-size:13px;cursor:pointer;list-style:none;color:#fff;background:#0D2640;display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:9px;font-weight:800;padding:3px 10px;border-radius:999px;background:#0066CC;color:#fff;white-space:nowrap">${dayLabel}</span>
              <span>${esc(r.actividad || tipoLabel)} ${isToday ? '<span style="font-size:9px;font-weight:800;padding:2px 8px;border-radius:999px;background:#2E9E70;color:#fff;margin-left:6px">HOY</span>' : ''}</span>
            </div>
            <span style="font-size:10px;color:rgba(255,255,255,0.6);font-weight:700">${ejercicios.length} ejercicios ▼</span>
          </summary>
          <div style="padding:8px 12px 0 12px;display:flex;gap:8px;align-items:center">
             <span style="font-size:9px;font-weight:700;color:#6B7280;background:#F3F4F6;padding:3px 8px;border-radius:999px">${ejercicios.length} ejercicios</span>
             <span style="font-size:9px;font-weight:700;color:#6B7280;background:#F3F4F6;padding:3px 8px;border-radius:999px">${bloques.length} bloques</span>
             <span style="font-size:9px;font-weight:700;color:#6B7280;background:#F3F4F6;padding:3px 8px;border-radius:999px">~45 min</span>
          </div>
          <div class="content" style="padding:10px 12px 12px 12px">
            ${isToday ? `<div style="font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;padding-left:2px">CALENTAMIENTO</div>` : ''}
            ${warmupHtml}
             ${(() => {
               const normalBloques = bloques.filter((b) => (b.ejercicios || []).every((ex) => (ex.musculo || '').toLowerCase() !== 'cardio'));
               const cardioBloques = bloques.filter((b) => (b.ejercicios || []).some((ex) => (ex.musculo || '').toLowerCase() === 'cardio'));
                const hasNormal = normalBloques.length > 0;
                const hasCardio = cardioBloques.length > 0;
                const parts = [];
               if (hasNormal) {
                 parts.push(`
                   <div style="margin-top:${isToday && warmupHtml ? '8px' : '0'}">
                      ${normalBloques.map((bloque, bIdx) => {
                        const color = bloqueColor(bloque.tipo);
                        const isMulti = Boolean(bloque.tipo);
                        const aproxEjs = (bloque.ejercicios || []).filter((ex) => ex.faseId === 'SA');
                        const otrosEjs = (bloque.ejercicios || []).filter((ex) => ex.faseId !== 'SA');
                        return `
                          <div style="margin-bottom:${bIdx > 0 ? '8px' : '0'};padding-top:${bIdx > 0 ? '6px' : '0'}">
                             <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;opacity:.7">
                               <span style="width:14px;height:14px;border-radius:999px;background:#0D2640;color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;flex-shrink:0">${esc(bloque.letra)}</span>
                               <span style="font-size:8px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0D2640">${esc(bloque.tipo || 'BLOQUE')}</span>
                             </div>
                            <div style="${isMulti ? 'margin-left:10px;border-left:1px solid #F3F4F6;padding-left:8px' : ''}">
                              ${aproxEjs.length ? `<div style="font-size:8px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#6B7280;margin-bottom:3px;margin-top:2px">APROXIMACIÓN</div>` + aproxEjs.map((ex, exIdx) => renderEjercicioRow(ex, exIdx, aproxEjs.length)).join('') + `<div style="height:6px"></div>` : ''}
                              ${otrosEjs.map((ex, exIdx) => renderEjercicioRow(ex, exIdx, otrosEjs.length)).join('')}
                            </div>
                          </div>
                       `;
                     }).join('')}
                   </div>
                 `);
               }
              if (hasCardio) {
                parts.push(`
                  ${cardioBloques.map((bloque, bIdx) => {
                    const isMulti = Boolean(bloque.tipo);
                    return `
                      <div style="margin-top:${hasNormal && bIdx === 0 ? '8px' : '0'};padding-top:${bIdx > 0 ? '6px' : '0'}">
                         <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
                           <span style="width:14px;height:14px;border-radius:999px;background:#EF4444;color:#fff;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;flex-shrink:0">C</span>
                           <span style="font-size:8px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#EF4444">CARDIO</span>
                         </div>
                         <div style="${isMulti ? 'margin-left:10px;border-left:1px solid #FECACA;padding-left:8px' : ''}">
                           ${bloque.ejercicios.map((ex, exIdx) => renderEjercicioRow(ex, exIdx, bloque.ejercicios.length)).join('')}
                         </div>
                      </div>
                    `;
                  }).join('')}
                `);
              }
              return parts.join('');
            })()}
          </div>
        </details>
      `;
    };

     return `
       ${days.map(d => dayDetails(d.label, d.key, d.dia)).join('')}
     `;
  };

  const comidasHTML = () => {
    if (!dayMeals.length) return '<div style="text-align:center;padding:20px;opacity:.6;font-size:11px;color:#6B7280">Sin comidas cargadas</div>';

    const normalizedDayMeals = dayMeals.map(normalizeMeal);

    const grouped = {};
    normalizedDayMeals.forEach(meal => {
      const key = meal.time || meal.tiempo || 'Comida';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(meal);
    });

    return Object.entries(grouped).map(([time, meals]) => {
      const totalKcal = meals.reduce((sum, m) => sum + getMealTotalKcal(m), 0);
      const macrosTotal = meals.reduce((acc, m) => {
        const mt = getMealTotalMacros(m);
        acc.p += mt.p || 0;
        acc.c += mt.c || 0;
        acc.g += mt.g || 0;
        return acc;
      }, { p: 0, c: 0, g: 0 });
      const p = macrosTotal.p;
      const c = macrosTotal.c;
      const g = macrosTotal.g;

      const meal = meals[0];
      const normalizedMeal = normalizeMeal(meal);
      const menuTypeLabel = normalizedMeal.menuType === 'armar' ? 'Armar menú' : normalizedMeal.menuType === 'fijo' ? 'Menú fijo' : '';

      const GROUP_ORDER = { 'proteinas': 0, 'carbohidratos': 1, 'grasas': 2 };
      const getFoodGroup = (food) => {
        const m = food.macros;
        if (!m) return null;
        const { proteinas, carbos, grasas } = m;
        if (proteinas > 0 && proteinas >= carbos && proteinas >= grasas) {
          return { key: 'proteinas', label: 'PROT', bg: '#0066CC' };
        }
        if (carbos > 0 && carbos >= proteinas && carbos >= grasas) {
          return { key: 'carbohidratos', label: 'CARB', bg: '#2E9E70' };
        }
        if (grasas > 0 && grasas >= proteinas && grasas >= carbos) {
          return { key: 'grasas', label: 'GRASA', bg: '#CC6600' };
        }
        return null;
      };
      const getFoodGroupBadge = (food) => {
        const g = getFoodGroup(food);
        if (!g) return '';
        return `<span style="font-size:8px;font-weight:800;padding:2px 6px;border-radius:999px;background:${g.bg};color:#fff;white-space:nowrap;margin-right:6px">${g.label}</span>`;
      };

      const formatQuantity = (f) => {
        const gramsNum = parseFloat(String(f.grams || '').replace(',', '.'));
        const hasGrams = Number.isFinite(gramsNum) && gramsNum > 0;
        let cantidadNum = parseFloat(String(f.cantidad || '').replace(',', '.'));
        const hasCantidad = Number.isFinite(cantidadNum) && cantidadNum > 0;
        let unit = String(f.unit || '').trim();
        const porcion = String(f.porcion || '').trim();

        const weightUnits = ['g', 'kg', 'mg', 'gr', 'gramo', 'gramos', 'grano', 'granos'];
        const isWeightUnit = (u) => weightUnits.includes(u.toLowerCase());

        const pluralize = (u, count) => {
          if (count === 1) return u;
          const lower = u.toLowerCase();
          if (/^(taz[oó]n|cdita?|cucharadita|cucharada|cda|unidad|porci[oó]n|rebanada|rodaja|filete|pechuga|huevo|pan|tortilla|barra|bolita?|pu[ñn]ado|manojo|rama|hoja|lata|sobre|tableta|cepillo|vaso|pizca|chorrito|loncha|lonja|rac[íi]m|uva|almendra|nuez|pistacho|cacahuate|casta[ñn]a|semilla|fruta|verdura|vegetal|carne|pescado|marisco|queso|leche|yogur|crema|arroz|pasta|taco|wrap|sandwich|smoothie|jugo|agua|refresco|infusi[oó]n|caf[ée]|t[ée])$/i.test(lower)) {
            return u + 's';
          }
          if (lower === 'unidad') return 'unidades';
          return u;
        };

        if (!hasCantidad && porcion) {
          const numMatch = porcion.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
          if (numMatch) {
            cantidadNum = parseFloat(numMatch[1].replace(',', '.'));
            if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) cantidadNum = 1;
            const rest = numMatch[2].trim();
            if (rest) unit = rest;
          } else if (!unit) {
            unit = porcion;
          }
        }

        const effectiveCount = (hasCantidad || (!hasCantidad && porcion && /^\d/.test(porcion))) ? (hasCantidad ? cantidadNum : (Number.isFinite(cantidadNum) ? cantidadNum : 1)) : (hasGrams ? 1 : 0);
        const displayUnit = unit || porcion || '';
        const isDisplayWeight = isWeightUnit(displayUnit);

        if (effectiveCount > 0 && displayUnit) {
          const unitPlural = pluralize(displayUnit, effectiveCount);
          if (hasGrams && !isDisplayWeight) {
            return `${gramsNum}g (${effectiveCount} ${unitPlural})`;
          }
          if (hasGrams && isDisplayWeight) {
            return `${gramsNum}g`;
          }
          return `${effectiveCount} ${unitPlural}`;
        }

        if (hasGrams && displayUnit && !isDisplayWeight) {
          const assumedCount = 1;
          const unitPlural = pluralize(displayUnit, assumedCount);
          return `${gramsNum}g (${assumedCount} ${unitPlural})`;
        }
        if (hasGrams) {
          return `${gramsNum}g`;
        }
        if (displayUnit && displayUnit !== 'g') {
          const assumedCount = 1;
          const unitPlural = pluralize(displayUnit, assumedCount);
          return `${assumedCount} ${unitPlural}`;
        }
        return '';
      };

      const renderFoodItem = (food, isLast) => {
        const badge = getFoodGroupBadge(food);
        const qty = formatQuantity(food);
        return `
          <div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:${!isLast ? '1px solid #F3F4F6' : 'none'};flex-wrap:wrap">
            <div style="font-size:10px;color:#6B7280;font-weight:600;min-width:70px;flex-shrink:0">${qty}</div>
            <div style="flex:1;min-width:0;display:flex;align-items:center;gap:4px;flex-wrap:wrap">
              <span style="font-size:10px;font-weight:700;color:#0D2640;line-height:1.3">${esc(food.name || '')}</span>
              ${badge}
            </div>
            <div style="font-size:10px;color:#6B7280;font-weight:700;white-space:nowrap;flex-shrink:0;margin-left:auto">${food.kcal || '0'} kcal</div>
          </div>
        `;
      };

      const renderFoodList = (foods) => {
        if (!foods.length) return '';
        const filtered = foods.filter(f => f.name && String(f.name).trim() !== '');
        if (!filtered.length) return '';
        const hasAnyMacros = filtered.some(f => f.macros);
        let sortedFoods = filtered;
        if (hasAnyMacros) {
          sortedFoods = [...filtered].sort((a, b) => {
            const oa = getFoodGroup(a) ? GROUP_ORDER[getFoodGroup(a).key] : 99;
            const ob = getFoodGroup(b) ? GROUP_ORDER[getFoodGroup(b).key] : 99;
            return oa - ob;
          });
        }
        return sortedFoods.map((f, i) => renderFoodItem(f, i === sortedFoods.length - 1)).join('');
      };

      const renderMenu = (menu, menuIdx, totalMenus) => {
        const menuName = menu.nombre || (totalMenus > 1 ? `Opción ${menuIdx + 1}` : '');
        const alimentos = (menu.alimentos || []).filter(a => a.name && String(a.name).trim() !== '');
        const hasAlimentos = alimentos.length > 0;
        const hasMenuName = menuName.length > 0;

        if (!hasAlimentos) return '';

        return `
          ${hasMenuName ? `<div style="font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#0D2640;margin-bottom:4px;margin-top:${menuIdx > 0 ? '10px' : '6px'};padding-top:${menuIdx > 0 ? '8px' : '0'}">${esc(menuName)}</div>` : ''}
          ${renderFoodList(alimentos)}
        `;
      };

      const renderArmar = () => {
        const foods = meals.flatMap(m => m.foods || []).filter(f => f.name && String(f.name).trim() !== '');
        if (!foods.length) return '';
        const grupos = foods.reduce((acc, f) => {
          const g = f.grupo || 'otros';
          if (!acc[g]) acc[g] = [];
          acc[g].push(f);
          return acc;
        }, {} as Record<string, typeof foods>);
        const GRUPO_LABELS: Record<string, string> = {
          proteinas: 'PROTEÍNAS',
          carbohidratos: 'CARBOHIDRATOS',
          grasas: 'GRASAS',
          lacteos: 'LÁCTEOS',
          verduras: 'VERDURAS',
          frutas: 'FRUTAS',
          otros: 'OTROS',
        };
        const GRUPO_COLORS: Record<string, string> = {
          proteinas: '#0066CC',
          carbohidratos: '#2E9E70',
          grasas: '#CC6600',
          lacteos: '#0D2640',
          verduras: '#2E9E70',
          frutas: '#CC6600',
          otros: '#6B7280',
        };
        return Object.entries(grupos).map(([grupo, items]) => {
          const label = GRUPO_LABELS[grupo] || grupo.toUpperCase();
          const color = GRUPO_COLORS[grupo] || '#6B7280';
          return `
            <div style="font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${color};margin-bottom:4px;margin-top:6px">${esc(label)}</div>
            ${renderFoodList(items)}
          `;
        }).join('');
      };

      const allMenus = meals.flatMap(m => (m.menus || [])).filter((menu) => (menu.alimentos || []).some(a => a.name && String(a.name).trim() !== ''));
      const hasMenus = allMenus.length > 0;
      const hasArmar = normalizedMeal.menuType === 'armar' && meals.flatMap(m => m.foods || []).some(f => f.name && String(f.name).trim() !== '');

      return `
        <details class="meal-details" style="border:1px solid #E8E8E8;border-radius:12px;margin:0 0 10px 0;background:#fff">
          <summary style="padding:11px 12px;cursor:pointer;list-style:none;color:#0D2640;display:flex;flex-direction:column;gap:2px">
            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:6px">
              <div style="display:flex;align-items:center;gap:4px;flex:1;min-width:0">
                <span style="font-size:9px;font-weight:800;padding:3px 8px;border-radius:999px;background:#2E9E70;color:#fff;white-space:nowrap">${esc(normalizedMeal.hour || normalizedMeal.tiempo || '')}</span>
                ${menuTypeLabel ? `<span style="font-size:9px;font-weight:800;padding:2px 8px;border-radius:999px;background:#0B63CE;color:#fff;white-space:nowrap">${menuTypeLabel}</span>` : ''}
              </div>
              <span style="font-size:10px;color:#6B7280;font-weight:700;white-space:nowrap;flex-shrink:0">${totalKcal} kcal • ${p}P ${c}C ${g}G ▼</span>
            </div>
            <span style="font-size:13px;font-weight:700;color:#0D2640">${esc(time)}</span>
          </summary>
          <div class="content" style="padding:10px 12px 12px 12px">
            ${hasMenus ? allMenus.map((menu, idx) => renderMenu(menu, idx, allMenus.length)).join('') : ''}
            ${hasArmar ? renderArmar() : ''}
          </div>
        </details>
      `;
    }).join('');
  };

   const suplementosHTML = () => {
     if (!daySupps.length) return '<div style="text-align:center;padding:20px;opacity:.6;font-size:11px;color:#6B7280">Sin suplementos</div>';

     const grouped = {};
     daySupps.forEach(s => {
       const key = s.horario || s.hora || 'Sin horario';
       if (!grouped[key]) grouped[key] = [];
       grouped[key].push(s);
     });

     const formatSupplementQty = (sup) => {
       const match = supplementDatabase.find((db) => db.nombre.toLowerCase() === (sup.nombre || '').toLowerCase());
       const grams = sup.gramos || (match ? String(match.dosisEstandar || '') : '');
       const unidad = match ? match.unidad : '';
       const porcion = sup.porcion || (match ? match.porcionSugerida : '') || '';
       
       const gramsNum = parseFloat(String(grams || '').replace(',', '.'));
       const hasGrams = Number.isFinite(gramsNum) && gramsNum > 0;
       
       if (hasGrams && unidad && unidad !== 'g') {
         return `${gramsNum}${unidad} (${porcion || '1 toma'})`;
       }
       if (hasGrams && porcion) {
         return `${gramsNum}g (${porcion})`;
       }
       if (hasGrams) {
         return `${gramsNum}g`;
       }
       if (porcion) {
         return porcion;
       }
       return '';
     };

     return `
       <details class="supp-details" style="border:1px solid #E8E8E8;border-radius:12px;margin:0 0 10px 0;background:#fff">
         <summary style="padding:11px 12px;font-weight:700;font-size:13px;cursor:pointer;list-style:none;color:#0D2640;display:flex;align-items:center;justify-content:space-between">
           <span>Suplementación</span>
           <span style="font-size:10px;color:#6B7280;font-weight:700">${daySupps.length} items ▼</span>
         </summary>
         <div class="content" style="padding:10px 12px 12px 12px">
           ${Object.entries(grouped).map(([horario, sups]) => `
             <div style="margin-bottom:10px">
               <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                 <span style="font-size:9px;font-weight:800;padding:3px 8px;border-radius:999px;background:#2E9E70;color:#fff;white-space:nowrap">${esc(horario)}</span>
                 <span style="font-size:10px;font-weight:700;color:#6B7280">${sups.length} suplementos</span>
               </div>
               ${sups.map((sup, idx) => {
                 const qty = formatSupplementQty(sup);
                 const isLast = idx === sups.length - 1;
                 return `
                   <div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:${!isLast ? '1px solid #F3F4F6' : 'none'};flex-wrap:wrap">
                     <div style="font-size:10px;color:#6B7280;font-weight:600;min-width:70px;flex-shrink:0">${qty}</div>
                     <div style="flex:1;min-width:0;display:flex;align-items:center;gap:4px;flex-wrap:wrap">
                       <span style="font-size:11px;font-weight:700;color:#0D2640;line-height:1.3">${esc(sup.nombre || sup.suplemento || '')}</span>
                     </div>
                   </div>
                   ${sup.notas ? `<div style="font-size:10px;color:#6B7280;margin-top:2px;font-style:italic">${esc(sup.notas)}</div>` : ''}
                 `;
               }).join('')}
             </div>
           `).join('')}
         </div>
       </details>
     `;
   };

  const metricCard = (label, value, valueColor = COLORS.navy, unit = '', helper = '') => `
    <div style="background:${COLORS.white};border:1px solid ${COLORS.gray};border-radius:16px;padding:16px;text-align:center;min-width:70px;flex:1 1 calc(25% - 6px)">
      <span style="font-size:8px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.grayMedium};display:block;margin-bottom:4px">${esc(label)}</span>
      <span style="font-size:14px;font-weight:800;color:${valueColor}">${esc(value)}${unit ? ' ' + esc(unit) : ''}</span>
      ${helper ? `<div style="font-size:9px;color:${COLORS.grayMedium};margin-top:4px">${esc(helper)}</div>` : ''}
    </div>
  `;

  const infoNutricionalHTML = () => {
    const totalKcal = meals.reduce((sum, m) => sum + getMealTotalKcal(m), 0);
    const totalMacros = meals.reduce((acc, m) => {
      const mt = getMealTotalMacros(m);
      acc.p += mt.p || 0;
      acc.c += mt.c || 0;
      acc.g += mt.g || 0;
      return acc;
    }, { p: 0, c: 0, g: 0 });
    const hasData = totalKcal > 0 || totalMacros.p > 0 || totalMacros.c > 0 || totalMacros.g > 0;
    if (!hasData) return '';
    return `
      <div style="margin-bottom:16px">
        ${tNutri.estrategia ? `<div style="font-size:10px;font-weight:800;padding:3px 10px;border-radius:999px;background:#0D2640;color:#fff;display:inline-block;margin-bottom:10px">${esc(tNutri.estrategia)}</div>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          ${totalKcal ? metricCard('KCAL', totalKcal, COLORS.navy) : ''}
          ${totalMacros.p ? metricCard('PROTEÍNA', totalMacros.p + 'P', COLORS.blue) : ''}
          ${totalMacros.c ? metricCard('CARBO', totalMacros.c + 'C', COLORS.green) : ''}
          ${totalMacros.g ? metricCard('GRASAS', totalMacros.g + 'G', '#CC6600') : ''}
        </div>
        ${tNutri.suple ? `<div style="font-size:10px;color:#4B5563"><b>Suplementación recomendada:</b> ${esc(tNutri.suple)}</div>` : ''}
      </div>
    `;
  };

  const infoClinicaHTML = () => {
    if (!clinico.retroalimentacion?.length && !clinico.diagnostico?.length && !clinico.objetivos?.length) return '';
    return `
      <details class="collapsible">
        <summary style="width:100%;box-sizing:border-box">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;font-size:12px;font-weight:800;letter-spacing:1px;color:#0D2640;text-transform:uppercase;width:100%;box-sizing:border-box">
            <span>Información clínica</span>
            <span style="font-size:10px;color:#6B7280;flex-shrink:0;padding:6px 8px">▼</span>
          </div>
        </summary>
        <div class="collapsed-content" style="padding:8px 16px">
          ${clinico.retroalimentacion?.length ? `
            <div style="padding-bottom:10px;margin-bottom:10px">
              <div style="font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;margin-bottom:6px">RETROALIMENTACIÓN</div>
              ${clinico.retroalimentacion.map((item, i) => `
                <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #F3F4F6">
                  <span style="width:16px;height:16px;border-radius:999px;background:#2E9E70;color:#fff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;flex-shrink:0">${i + 1}</span>
                  <span style="font-size:10px;color:#4B5563;line-height:1.4">${esc(item)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${clinico.diagnostico?.length ? `
            <div style="padding-bottom:10px;margin-bottom:10px">
              <div style="font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;margin-bottom:6px">DIAGNÓSTICO</div>
              ${clinico.diagnostico.map((item, i) => `
                <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #F3F4F6">
                  <span style="width:16px;height:16px;border-radius:999px;background:#0D2640;color:#fff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;flex-shrink:0">${i + 1}</span>
                  <span style="font-size:10px;color:#4B5563;line-height:1.4">${esc(item)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${clinico.objetivos?.length ? `
            <div style="padding-top:10px;margin-top:10px">
              <div style="font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;margin-bottom:6px">OBJETIVOS Y PLAN A SEGUIR</div>
              ${clinico.objetivos.map((item, i) => `
                <div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #F3F4F6">
                  <span style="width:16px;height:16px;border-radius:999px;background:#0066CC;color:#fff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;flex-shrink:0">${i + 1}</span>
                  <span style="font-size:10px;color:#4B5563;line-height:1.4">${esc(item)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${habitHtml}
          ${supplementsStrategyHtml}
        </div>
      </details>
    `;
  };

  const tratamientoDeportivoHTML = () => {
    if (!tEntre.estrategia && !tEntre.dias) return '';
    const volumen = (Object.values(routines || {}) || []).reduce((sum, r) => {
      return sum + (r.fases || []).reduce((s, fase) => {
        return s + (fase.bloques || []).reduce((ss, bloque) => {
          return ss + (bloque.ejercicios || []).reduce((sss, ej) => sss + (parseInt(ej.series || '0') || 0), 0);
        }, 0);
      }, 0);
    }, 0);
    return `
      <div style="margin-bottom:16px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          ${tEntre.estrategia ? `<div style="background:${COLORS.navy};color:${COLORS.white};padding:16px;border-radius:16px;text-align:center;min-width:70px;flex:1 1 calc(25% - 6px)"><span style="font-size:8px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.7);display:block;margin-bottom:4px">ESTRATEGIA</span><span style="font-size:14px;font-weight:800;color:${COLORS.white}">${esc(tEntre.estrategia)}</span></div>` : ''}
          ${metricCard('DÍAS', diasStat || '—', COLORS.blue, '', 'Meta semanal')}
          ${metricCard('CARDIO', cardioStat || '—', COLORS.green, '', 'Sesiones')}
          ${metricCard('VOLUMEN', volumen || '—', COLORS.navy, '', 'Series totales')}
        </div>
      </div>
    `;
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Plan DocFitness — ${esc(nombre)}</title>
<meta name="theme-color" content="#0D2640">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="description" content="Plan de entrenamiento y nutrición para ${esc(nombre)}">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{font-family:system-ui,-apple-system,sans-serif;background:#F8F9FC;color:#0D2640;line-height:1.45;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
img{max-width:100%;display:block}
a{color:#0D2640;text-decoration:none}
.wrap{max-width:560px;margin:0 auto;padding:16px 14px 0}
.app-footer{font-size:9px;letter-spacing:1px;color:#6B7280;font-weight:700;text-align:center;margin-top:0;text-transform:uppercase}
.app-footer-sub{font-size:8px;letter-spacing:0.8px;color:#9CA3AF;font-weight:600;text-align:center;margin-top:0;text-transform:uppercase}

.hero{margin-bottom:16px}

.stats{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.stat{background:#fff;border:1px solid ${COLORS.gray};border-radius:14px;padding:10px;text-align:center;flex:1 1 calc(33.333% - 6px);min-width:120px}
.stat span{font-size:9px;letter-spacing:1px;color:#6B7280;font-weight:700;display:block}
.stat b{font-size:14px;font-weight:800;margin-top:2px;display:block;color:#0D2640}

.training-card{background:#fff;border:1px solid #E8E8E8;border-radius:20px;padding:16px;color:#0D2640;margin-bottom:12px}
.training-header{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.training-label{font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#6B7280}
.training-title{font-size:20px;font-weight:900;line-height:1.1;margin-top:4px;color:#0D2640}
.training-list{margin-top:12px}
.training-item{padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.04)}
.training-item:last-child{border-bottom:none}
.training-item-meta{font-size:10px;color:#6B7280;margin-top:2px}
.training-badge{font-size:9px;font-weight:800;padding:2px 8px;border-radius:999px;background:#0B63CE;color:#fff;white-space:nowrap;margin-left:8px}

.section-card{background:#fff;border:1px solid #E8E8E8;border-radius:20px;padding:16px;margin-bottom:12px}
.section-title{font-size:11px;font-weight:800;letter-spacing:1px;color:#0D2640;margin-bottom:10px;text-transform:uppercase}

.supp-pill{font-size:9px;font-weight:800;padding:4px 10px;border-radius:999px;background:#2E9E70;color:#fff;white-space:nowrap}

.dia-section{margin-bottom:24px}
details{border:1px solid #E8E8E8;border-radius:12px;margin:0 0 10px 0;background:#fff}
summary{padding:11px 12px;font-weight:700;font-size:13px;cursor:pointer;list-style:none;color:#0D2640}
summary::-webkit-details-marker{display:none}
details[open] summary{border-bottom:1px solid #E8E8E8;background:#fafafa;border-radius:12px 12px 0 0}
.content{padding:10px 12px 12px 12px}
.day-details summary{display:flex;align-items:center;justify-content:space-between;border-radius:12px 12px 12px 12px}
.day-details[open] summary{background:#0D2640;color:#fff;border-radius:12px 12px 0 0;border-bottom:1px solid #F3F4F6}

/* Collapsible sections */
.collapsible{border:1px solid #E8E8E8;border-radius:16px;background:#fff;margin-bottom:12px;width:100%;box-sizing:border-box}
.collapsible summary{padding:12px 16px;cursor:pointer;list-style:none;font-size:12px;font-weight:800;letter-spacing:1px;color:#0D2640;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase}
.collapsible summary::-webkit-details-marker{display:none}
.collapsible[open] summary{border-bottom:1px solid #E8E8E8}
.collapsible .collapsed-content{padding:0 16px 16px}

.day-nav select{width:100%;padding:10px 12px;border-radius:12px;border:1px solid #E8E8E8;background:#fff;font-size:12px;font-weight:700;color:#0D2640}

/* Guía */
.guia-outer{border:1px solid #E8E8E8;border-radius:16px;background:#fff;margin-bottom:12px}
.guia-outer > summary{padding:16px;cursor:pointer;list-style:none;color:#fff;background:#0066CC;border-radius:12px;display:flex;justify-content:space-between;align-items:center}
.guia-outer[open] > summary{border-bottom:1px solid #E8E8E8;background:#0066CC;border-radius:12px 12px 0 0}
.guia-outer > .guia-content{padding:12px}
.guia-inner{border:1px solid #E8E8E8;border-radius:12px;background:#fff;margin-bottom:8px}
.guia-inner > summary{padding:0;cursor:pointer;list-style:none;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:space-between;color:#0D2640;background:#fff;border-radius:12px}
.guia-inner[open] > summary{background:#F8F9FC;border-radius:12px 12px 0 0}
.guia-inner .guia-inner-content{padding:16px;font-size:12px;color:#4B5563;line-height:1.6}
</style>
</head>
<body>
<header style="background:#0066CC;padding:18px 16px;display:flex;justify-content:center;align-items:center">
  <div style="height:28px;width:auto;display:block;filter:brightness(0) invert(1)">${logoHTML}</div>
</header>

<div class="wrap">
  <!-- HERO -->
   ${heroHTML()}

    <!-- AVANCES -->
    <div style="margin-top:4px;margin-bottom:8px;font-size:11px;font-weight:800;letter-spacing:1px;color:#0D2640;text-transform:uppercase">Avances</div>
    ${avancesCard()}

    <!-- INFORMACIÓN CLÍNICA -->
    ${infoClinicaHTML()}

    <!-- TRATAMIENTO DEPORTIVO -->
    <div style="margin-top:4px;margin-bottom:8px;font-size:11px;font-weight:800;letter-spacing:1px;color:#0D2640;text-transform:uppercase">Tratamiento deportivo</div>
    ${tratamientoDeportivoHTML()}

    <!-- CALENTAMIENTO -->
    <div style="margin-top:4px;margin-bottom:8px;font-size:11px;font-weight:800;letter-spacing:1px;color:#0D2640;text-transform:uppercase">Calentamiento</div>
    ${calentamientoHTML()}

    <!-- CALENDARIO SEMANAL -->
    <div style="margin-top:4px;margin-bottom:8px;font-size:11px;font-weight:800;letter-spacing:1px;color:#0D2640;text-transform:uppercase">Calendario semanal</div>
    ${calendarioHTML()}

    <!-- TRATAMIENTO NUTRICIONAL -->
    <div style="margin-top:4px;margin-bottom:8px;font-size:11px;font-weight:800;letter-spacing:1px;color:#0D2640;text-transform:uppercase">Tratamiento nutricional</div>
    ${infoNutricionalHTML()}

    <!-- COMIDAS -->
    <div style="margin-top:4px;margin-bottom:8px;font-size:11px;font-weight:800;letter-spacing:1px;color:#0D2640;text-transform:uppercase">Comidas</div>
    ${comidasHTML()}

    <!-- SUPLEMENTOS -->
    <div style="margin-top:4px;margin-bottom:8px;font-size:11px;font-weight:800;letter-spacing:1px;color:#0D2640;text-transform:uppercase">Tratamiento de suplementación</div>
    ${suplementosHTML()}

    <!-- GUÍA -->
    ${guiaHTML()}
    <!-- GLOSARIO -->
    ${glosarioHTML()}

  <div class="app-footer">DOCFITNESS ${new Date().getFullYear()}</div>
   <div class="app-footer-sub" style="margin-top:4px">ESTÉTICA CORPORAL | MEDICINA | NUTRICIÓN | ENTRENAMIENTO</div>
  </div>
</body>
</html>`;
};

export const downloadDashboardFitness = (data, fileName, mode = 'todo') => {
  try {
    const html = generateDashboardFitnessHTML(data, mode);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (fileName || data.person?.id || 'Paciente').replace(/[^a-zA-Z0-9-_]/g, '').trim() || 'Paciente';
    a.href = url;
    a.download = `Plan-${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (err) {
    console.error('Error generating dashboard', err);
    const win = window.open('', '_blank');
    if (!win) return false;
    win.document.write(generateDashboardFitnessHTML(data, mode));
    win.document.close();
    return true;
  }
};
