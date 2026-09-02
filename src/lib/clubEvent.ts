import {
  KIND_META,
  WEEKLY_SCHEDULE,
  WEEK_DAYS,
  type ScheduleKind,
  type WeekDayId,
} from "@/data/clubSchedule";
import { CLUB_EVENTS } from "@/data/club";

export const EVENING_PRICE = 200;
export const EVENT_PRICE = 500;
export const EVENT_CAPACITY = 12;

export type ResolvedEvent = {
  slug: string;
  kind: ScheduleKind | "special";
  title: string;
  description: string;
  dateLabel: string;
  weekdayLabel?: string;
  time: string;
  duration?: string;
  host?: string;
  age?: string;
  price: number;
  capacity: number;
  booked: number;
  booking: boolean;
  recurring: boolean;
  weekDay?: WeekDayId;
};

export const isBoardGameEvent = (event: ResolvedEvent) =>
  event.kind.startsWith("board_") || event.title.toLowerCase().includes("настол");

export const slotSlug = (day: WeekDayId, start: string, kind: ScheduleKind) =>
  `w${day}-${start.replace(":", "")}-${kind}`;

export const specialSlug = (id: number) => `e${id}`;

const RU_MONTHS_SHORT = ["ЯНВ","ФЕВ","МАР","АПР","МАЯ","ИЮН","ИЮЛ","АВГ","СЕН","ОКТ","НОЯ","ДЕК"];
const RU_MONTHS_GEN = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

/** "18 МАЯ" -> "18 мая" */
export const humanEventDate = (s: string) => {
  const m = s.trim().match(/^(\d{1,2})\s+([А-ЯЁ]+)$/i);
  if (!m) return s;
  const idx = RU_MONTHS_SHORT.indexOf(m[2].toUpperCase().slice(0, 3));
  return idx < 0 ? s : `${parseInt(m[1], 10)} ${RU_MONTHS_GEN[idx]}`;
};

const DEFAULT_DESC =
  "Регулярная встреча соседского клуба. Можно прийти одному или компанией — за столом всегда найдётся место, а ведущий поможет влиться и объяснит правила.";

export const resolveEvent = (slug: string): ResolvedEvent | null => {
  if (slug.startsWith("e")) {
    const id = parseInt(slug.slice(1), 10);
    const e = CLUB_EVENTS.find((x) => x.id === id);
    if (!e) return null;
    return {
      slug: specialSlug(e.id),
      kind: "special",
      title: e.title,
      description: e.desc,
      dateLabel: humanEventDate(e.date),
      time: e.time,
      duration: e.duration,
      host: e.host,
      age: e.ageLabel,
      price: EVENT_PRICE,
      capacity: EVENT_CAPACITY,
      booked: Math.max(0, EVENT_CAPACITY - e.seatsLeft),
      booking: true,
      recurring: false,
    };
  }

  const m = slug.match(/^w(\d)-(\d{4})-(.+)$/);
  if (!m) return null;
  const day = parseInt(m[1], 10) as WeekDayId;
  const start = `${m[2].slice(0, 2)}:${m[2].slice(2)}`;
  const kind = m[3] as ScheduleKind;
  const slots = WEEKLY_SCHEDULE[day];
  if (!slots) return null;
  const s = slots.find((x) => x.start === start && x.kind === kind);
  if (!s) return null;
  const dayFull = WEEK_DAYS.find((w) => w.id === day)?.full ?? "";
  const meta = KIND_META[s.kind];

  return {
    slug: slotSlug(day, s.start, s.kind),
    kind: s.kind,
    title: s.title,
    description: s.note ? `${s.note[0].toUpperCase()}${s.note.slice(1)}. ${DEFAULT_DESC}` : DEFAULT_DESC,
    dateLabel: `Каждый${day === 6 || day === 7 ? "е" : ""} ${dayFull.toLowerCase()}`,
    weekdayLabel: dayFull,
    time: `${s.start}–${s.end}`,
    age: meta.age,
    price: EVENING_PRICE,
    capacity: s.capacity,
    booked: s.booked,
    booking: s.booking ?? true,
    recurring: true,
    weekDay: day,
  };
};

/** Ближайшая дата для повторяющегося дня недели */
export const nextDateFor = (day: WeekDayId, from = new Date()) => {
  const cur = ((from.getDay() + 6) % 7) + 1; // 1..7 Mon..Sun
  const diff = (day - cur + 7) % 7;
  const d = new Date(from);
  d.setDate(from.getDate() + diff);
  return d;
};

export const formatRuDate = (d: Date) =>
  `${d.getDate()} ${RU_MONTHS_GEN[d.getMonth()]}`;
