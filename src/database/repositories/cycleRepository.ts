import * as SQLite from 'expo-sqlite';
import { generateUUID as uuidv4 } from '../../utils/id';
import { format, differenceInDays, addDays, parseISO, isValid } from 'date-fns';

const getDb = () => SQLite.openDatabaseSync('daybook.db');

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleSettings {
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string | null;
  lutealLength: number;
}

export interface CycleLog {
  id: string;
  date: string;
  isPeriodDay: boolean;
  flowLevel: FlowLevel;
  symptoms: string[];
  mood: string | null;
  notes: string | null;
  waterGlasses: number;
  sleepHours: number;
  createdAt: number;
  updatedAt: number;
}

export interface CycleStatus {
  cycleDay: number;
  phase: CyclePhase;
  phaseLabel: string;
  daysUntilNextPeriod: number;
  predictedNextPeriod: string;
  predictedOvulation: string;
  isPeriodToday: boolean;
  phaseTip: string;
  phaseDescription: string;
  phaseColor: string;
}

export const cycleRepository = {
  getSettings: (): CycleSettings => {
    const db = getDb();
    const rows = db.getAllSync<any>(
      `SELECT cycle_length as cycleLength, period_length as periodLength,
              last_period_start as lastPeriodStart, luteal_length as lutealLength
       FROM cycle_settings
       WHERE id = 'default'`
    );

    if (rows.length > 0) {
      return {
        cycleLength: rows[0].cycleLength || 28,
        periodLength: rows[0].periodLength || 5,
        lastPeriodStart: rows[0].lastPeriodStart || null,
        lutealLength: rows[0].lutealLength || 14,
      };
    }

    // Default to last period starting 12 days ago for an active starter experience
    const defaultLastPeriod = format(addDays(new Date(), -12), 'yyyy-MM-dd');
    const now = Date.now();
    db.runSync(
      `INSERT OR IGNORE INTO cycle_settings (id, cycle_length, period_length, last_period_start, luteal_length, updated_at)
       VALUES ('default', 28, 5, ?, 14, ?)`,
      [defaultLastPeriod, now]
    );

    return {
      cycleLength: 28,
      periodLength: 5,
      lastPeriodStart: defaultLastPeriod,
      lutealLength: 14,
    };
  },

  updateSettings: (data: Partial<CycleSettings>): CycleSettings => {
    const db = getDb();
    const current = cycleRepository.getSettings();
    const now = Date.now();

    const updated = {
      cycleLength: data.cycleLength ?? current.cycleLength,
      periodLength: data.periodLength ?? current.periodLength,
      lastPeriodStart: data.lastPeriodStart ?? current.lastPeriodStart,
      lutealLength: data.lutealLength ?? current.lutealLength,
    };

    db.runSync(
      `INSERT INTO cycle_settings (id, cycle_length, period_length, last_period_start, luteal_length, updated_at)
       VALUES ('default', ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         cycle_length = excluded.cycle_length,
         period_length = excluded.period_length,
         last_period_start = excluded.last_period_start,
         luteal_length = excluded.luteal_length,
         updated_at = excluded.updated_at`,
      [
        updated.cycleLength,
        updated.periodLength,
        updated.lastPeriodStart,
        updated.lutealLength,
        now,
      ]
    );

    return updated;
  },

  getLogForDate: (date: string): CycleLog | null => {
    const db = getDb();
    const rows = db.getAllSync<any>(
      `SELECT id, date, is_period_day as isPeriodDay, flow_level as flowLevel,
              symptoms, mood, notes, water_glasses as waterGlasses, sleep_hours as sleepHours,
              created_at as createdAt, updated_at as updatedAt
       FROM cycle_logs
       WHERE date = ?`,
      [date]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      date: row.date,
      isPeriodDay: row.isPeriodDay === 1,
      flowLevel: (row.flowLevel || 'none') as FlowLevel,
      symptoms: row.symptoms ? row.symptoms.split(',') : [],
      mood: row.mood || null,
      notes: row.notes || null,
      waterGlasses: row.waterGlasses ?? 6,
      sleepHours: row.sleepHours ?? 7.5,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  saveLog: (
    date: string,
    data: {
      isPeriodDay: boolean;
      flowLevel?: FlowLevel;
      symptoms?: string[];
      mood?: string | null;
      notes?: string | null;
      waterGlasses?: number;
      sleepHours?: number;
    }
  ): CycleLog => {
    const db = getDb();
    const now = Date.now();
    const id = uuidv4();
    const symptomsStr = data.symptoms ? data.symptoms.join(',') : '';

    db.runSync(
      `INSERT INTO cycle_logs (id, date, is_period_day, flow_level, symptoms, mood, notes, water_glasses, sleep_hours, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         is_period_day = excluded.is_period_day,
         flow_level = excluded.flow_level,
         symptoms = excluded.symptoms,
         mood = excluded.mood,
         notes = excluded.notes,
         water_glasses = coalesce(excluded.water_glasses, cycle_logs.water_glasses),
         sleep_hours = coalesce(excluded.sleep_hours, cycle_logs.sleep_hours),
         updated_at = excluded.updated_at`,
      [
        id,
        date,
        data.isPeriodDay ? 1 : 0,
        data.flowLevel || 'none',
        symptomsStr,
        data.mood || null,
        data.notes || null,
        data.waterGlasses ?? 6,
        data.sleepHours ?? 7.5,
        now,
        now,
      ]
    );

    // If marked as period day and starts a fresh period, update lastPeriodStart
    if (data.isPeriodDay) {
      const settings = cycleRepository.getSettings();
      if (!settings.lastPeriodStart || date > settings.lastPeriodStart) {
        cycleRepository.updateSettings({ lastPeriodStart: date });
      }
    }

    return cycleRepository.getLogForDate(date)!;
  },

  getRecentLogs: (limit = 30): CycleLog[] => {
    const db = getDb();
    const rows = db.getAllSync<any>(
      `SELECT id, date, is_period_day as isPeriodDay, flow_level as flowLevel,
              symptoms, mood, notes, water_glasses as waterGlasses, sleep_hours as sleepHours,
              created_at as createdAt, updated_at as updatedAt
       FROM cycle_logs
       ORDER BY date DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      isPeriodDay: row.isPeriodDay === 1,
      flowLevel: (row.flowLevel || 'none') as FlowLevel,
      symptoms: row.symptoms ? row.symptoms.split(',') : [],
      mood: row.mood || null,
      notes: row.notes || null,
      waterGlasses: row.waterGlasses ?? 6,
      sleepHours: row.sleepHours ?? 7.5,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  },

  getStatus: (): CycleStatus => {
    const settings = cycleRepository.getSettings();
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayLog = cycleRepository.getLogForDate(todayStr);

    let lastStart = today;
    if (settings.lastPeriodStart) {
      try {
        const parsed = parseISO(settings.lastPeriodStart);
        if (isValid(parsed)) lastStart = parsed;
      } catch {}
    }

    const rawDiff = differenceInDays(today, lastStart);
    // Normalize cycle day to 1-based index within cycle length
    const cycleDay = (Math.max(0, rawDiff) % settings.cycleLength) + 1;
    const daysUntilNextPeriod = Math.max(0, settings.cycleLength - cycleDay + 1);

    const nextPeriodDate = addDays(today, daysUntilNextPeriod);
    const predictedNextPeriod = format(nextPeriodDate, 'MMMM d');

    // Ovulation typically occurs 14 days before next period
    const ovulationDay = Math.max(1, settings.cycleLength - settings.lutealLength);
    const daysUntilOvulation = ovulationDay - cycleDay;
    const ovulationDate = addDays(today, daysUntilOvulation);
    const predictedOvulation = format(ovulationDate, 'MMMM d');

    const isPeriodToday = todayLog ? todayLog.isPeriodDay : cycleDay <= settings.periodLength;

    // Determine phase
    let phase: CyclePhase = 'follicular';
    let phaseLabel = 'Follicular Phase';
    let phaseTip = 'Rising estrogen brings fresh energy and mental clarity. Great for learning and creative projects.';
    let phaseDescription = 'Fresh vitality, renewal, and rising stamina';
    let phaseColor = '#C58882';

    if (cycleDay <= settings.periodLength || isPeriodToday) {
      phase = 'menstrual';
      phaseLabel = 'Menstrual Phase';
      phaseTip = 'Sip warm chamomile or raspberry leaf tea. Prioritize gentle stretching and nourishing comfort food.';
      phaseDescription = 'Time to slow down, rest, and reflect peacefully';
      phaseColor = '#D4736C';
    } else if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
      phase = 'ovulation';
      phaseLabel = 'Ovulation Window';
      phaseTip = 'High vitality and social flow. Stay well hydrated and maintain your highest energy routines.';
      phaseDescription = 'Peak energy, natural confidence, and vibrancy';
      phaseColor = '#4A7C59';
    } else if (cycleDay > ovulationDay + 1) {
      phase = 'luteal';
      phaseLabel = 'Luteal Phase';
      phaseTip = 'Progesterone is peaking. Enjoy calming evenings, magnesium-rich snacks, and lighter workouts.';
      phaseDescription = 'Nesting energy, winding down, and deeper mindfulness';
      phaseColor = '#E8A56F';
    }

    return {
      cycleDay,
      phase,
      phaseLabel,
      daysUntilNextPeriod,
      predictedNextPeriod,
      predictedOvulation,
      isPeriodToday,
      phaseTip,
      phaseDescription,
      phaseColor,
    };
  },
};

