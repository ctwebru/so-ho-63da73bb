import { useMemo, useState } from "react";
import { CalendarDays, LayoutGrid, Rows3, CalendarRange, ChevronLeft, ChevronRight, Sparkles, Coins, Users, ClipboardCheck, ChevronRight as ChevronRightSm } from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  KIND_META,
  WEEKLY_SCHEDULE,
  WEEK_DAYS,
  todayId,
  type ScheduleSlot,
  type WeekDayId,
} from "@/data/clubSchedule";
import { CLUB_EVENTS, type ClubEvent } from "@/data/club";
import EventDetailDialog, { type EventDetail } from "./EventDetailDialog";
import { slotSlug, specialSlug } from "@/lib/clubEvent";

type Mode = "week" | "day" | "month";

const RU_MONTHS_SHORT = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЯ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];
const RU_MONTHS_FULL = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const RU_MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const parseEventDate = (s: string): { day: number; month: number } | null => {
  const m = s.trim().match(/^(\d{1,2})\s+([А-ЯЁ]+)$/i);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const monthIdx = RU_MONTHS_SHORT.indexOf(m[2].toUpperCase().slice(0, 3));
  if (monthIdx < 0) return null;
  return { day, month: monthIdx };
};

const jsDowToWeekDayId = (dow: number): WeekDayId => (dow === 0 ? 7 : dow) as WeekDayId;

const slotToDetail = (s: ScheduleSlot, dayFull: string): EventDetail => ({
  id: `slot-${dayFull}-${s.start}-${s.kind}`,
  slug: slotSlug(
    (WEEK_DAYS.find((w) => w.full === dayFull)?.id ?? 1) as WeekDayId,
    s.start,
    s.kind,
  ),
  kind: s.kind,
  title: s.title,
  description:
    s.note ??
    "Регулярная активность соседского клуба. Приходи один, с семьёй или зови компанию — место найдётся.",
  dateLabel: dayFull,
  time: `${s.start}–${s.end}`,
  note: "Записываться заранее не обязательно, но если планируешь прийти компанией — предупреди нас.",
});

const eventToDetail = (e: ClubEvent): EventDetail => ({
  id: `event-${e.id}`,
  slug: specialSlug(e.id),
  kind: "special",
  title: e.title,
  description: e.desc,
  dateLabel: e.date,
  time: e.time,
  duration: e.duration,
  host: e.host,
  ageLabel: e.ageLabel,
  seatsLeft: e.seatsLeft,
  image: e.image,
});

const EVENT_CAPACITY = 12;

const MetaRow = ({
  price,
  age,
  booking,
  capacity,
  booked,
  dark,
}: {
  price: number;
  age?: string;
  booking?: boolean;
  capacity: number;
  booked: number;
  dark?: boolean;
}) => {
  const pct = Math.min(100, Math.round((booked / Math.max(1, capacity)) * 100));
  const left = Math.max(0, capacity - booked);
  const almost = left <= Math.max(1, Math.round(capacity * 0.25));
  return (
    <div
      className={`mt-2 pt-2 border-t text-[11px] ${dark ? "border-border" : "border-current/15"}`}
    >
      {/* Row 1: money icon + age */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 rounded-full border border-current/25 px-1.5 py-0.5"
          title={price ? `${price} ₽` : undefined}
        >
          <Coins className="w-3 h-3" />
        </span>
        {age && (
          <span className="inline-flex items-center rounded-full border border-current/25 px-1.5 py-0.5 tabular-nums">
            {age}
          </span>
        )}
      </div>

      {/* Row 2: booking + capacity */}
      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
        {booking && (
          <span className="inline-flex items-center gap-1 rounded-full border border-current/25 px-1.5 py-0.5">
            <ClipboardCheck className="w-3 h-3" /> по записи
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full border border-current/25 px-1.5 py-0.5 tabular-nums">
          <Users className="w-3 h-3" /> до {capacity}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-current/15 overflow-hidden">
          <div
            className={`h-full rounded-full ${almost ? "bg-destructive" : "bg-current/60"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="tabular-nums whitespace-nowrap opacity-80">
          {left === 0 ? "мест нет" : almost ? `осталось ${left}` : `${booked}/${capacity}`}
        </span>
      </div>

      <div className="mt-1.5 flex justify-end">
        <span className="inline-flex items-center gap-0.5 font-medium underline underline-offset-2 decoration-current/40">
          подробнее <ChevronRightSm className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

const ClubSchedule = () => {
  const [mode, setMode] = useState<Mode>("week");
  const [activeDay, setActiveDay] = useState<WeekDayId>(todayId());
  const [detail, setDetail] = useState<EventDetail | null>(null);

  const now = new Date();
  const [monthCursor, setMonthCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const specialsByDay = useMemo(() => {
    const map = new Map<WeekDayId, ClubEvent[]>();
    CLUB_EVENTS.forEach((e, i) => {
      const day = (((i * 2) % 7) + 1) as WeekDayId;
      const list = map.get(day) ?? [];
      list.push(e);
      map.set(day, list);
    });
    return map;
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ClubEvent[]>();
    CLUB_EVENTS.forEach((e) => {
      const parsed = parseEventDate(e.date);
      if (!parsed) return;
      const year = parsed.month < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
      const key = `${year}-${parsed.month}-${parsed.day}`;
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    });
    return map;
  }, [now]);

  const today = todayId();

  return (
    <section className="container mx-auto px-6 pb-24">
      <div className="grid md:grid-cols-12 gap-8 mb-8 items-end">
        <div className="md:col-span-7">
          
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Расписание занятий
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Когда нет занятий и брони — клуб открыт для свободного входа. А по расписанию собираемся вместе:
            настолки, приставка, мастер-классы.
          </p>

        </div>
        <div className="md:col-span-5 md:justify-self-end inline-flex rounded-full border border-border bg-card p-1 text-sm flex-wrap">
          <ModeBtn active={mode === "month"} onClick={() => setMode("month")} icon={<CalendarRange className="w-3.5 h-3.5" />}>
            Месяц
          </ModeBtn>
          <ModeBtn active={mode === "week"} onClick={() => setMode("week")} icon={<LayoutGrid className="w-3.5 h-3.5" />}>
            Неделя
          </ModeBtn>
          <ModeBtn active={mode === "day"} onClick={() => setMode("day")} icon={<Rows3 className="w-3.5 h-3.5" />}>
            День
          </ModeBtn>
        </div>
      </div>

      {mode === "month" && (
        <MonthView
          cursor={monthCursor}
          onCursor={setMonthCursor}
          eventsByDate={eventsByDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onOpenDetail={setDetail}
        />
      )}

      {mode === "week" && (
        <div className="hidden md:block rounded-3xl border border-border bg-card overflow-hidden shadow-soft">
          <div className="grid grid-cols-7 divide-x divide-border">
            {WEEK_DAYS.map((d) => (
              <div
                key={d.id}
                className={`p-4 text-center ${
                  d.id === today ? "bg-accent/10" : "bg-secondary/30"
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {d.short}
                </div>
                <div className="font-display text-lg font-semibold mt-0.5">
                  {d.full}
                </div>
                {d.id === today && (
                  <div className="text-[10px] uppercase tracking-widest text-accent mt-1">
                    сегодня
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-border min-h-[420px]">
            {WEEK_DAYS.map((d) => {
              const slots = WEEKLY_SCHEDULE[d.id];
              const specials = specialsByDay.get(d.id) ?? [];
              return (
                <div
                  key={d.id}
                  className={`p-3 space-y-2 ${d.id === today ? "bg-accent/5" : ""}`}
                >
                  {slots.map((s, i) => {
                    const meta = KIND_META[s.kind];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => setDetail(slotToDetail(s, d.full))}
                        className={`w-full text-left rounded-2xl border p-3 ${meta.tone} hover:opacity-90 transition-opacity`}
                      >
                        <div className="text-[11px] uppercase tracking-widest tabular-nums opacity-80">
                          {s.start}–{s.end}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                          <div className="font-display text-sm font-semibold leading-tight">
                            {s.title}
                          </div>
                        </div>
                        {s.note && (
                          <div className="text-[11px] opacity-70 mt-1 leading-snug">
                            {s.note}
                          </div>
                        )}
                        <MetaRow price={200} age={meta.age} booking capacity={s.capacity} booked={s.booked} />

                      </button>
                    );
                  })}
                  {specials.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setDetail(eventToDetail(e))}
                      className="w-full text-left rounded-2xl border border-dashed border-accent/40 bg-background p-3 hover:bg-accent/5 transition-colors"
                    >
                      <div className="text-[10px] uppercase tracking-widest text-accent flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> событие · {e.time}
                      </div>
                      <div className="font-display text-sm font-medium leading-tight mt-1">
                        {e.title}
                      </div>
                      <div className="text-muted-foreground">
                        <MetaRow price={500} age={e.ageLabel} booking capacity={EVENT_CAPACITY} booked={Math.max(0, EVENT_CAPACITY - e.seatsLeft)} dark />
                      </div>

                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === "week" && (
        <div className="md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-6 px-6 snap-x">
            {WEEK_DAYS.map((d) => {
              const active = d.id === activeDay;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDay(d.id)}
                  className={`snap-start shrink-0 w-14 py-2.5 rounded-2xl border text-center transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-widest opacity-80">
                    {d.short}
                  </div>
                  {d.id === today && (
                    <div
                      className={`text-[9px] mt-0.5 ${
                        active ? "text-primary-foreground" : "text-accent"
                      }`}
                    >
                      сегодня
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <DayList
            day={activeDay}
            specials={specialsByDay.get(activeDay) ?? []}
            onOpen={setDetail}
          />
        </div>
      )}

      {mode === "day" && (
        <div className="space-y-4">
          {WEEK_DAYS.map((d) => (
            <div
              key={d.id}
              className={`rounded-3xl border p-5 md:p-6 ${
                d.id === today
                  ? "border-accent/40 bg-accent/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-baseline gap-3 mb-3">
                <div className="font-display text-xl md:text-2xl font-semibold">
                  {d.full}
                </div>
                {d.id === today && (
                  <div className="text-[10px] uppercase tracking-widest text-accent">
                    сегодня
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {WEEKLY_SCHEDULE[d.id].map((s, i) => {
                  const meta = KIND_META[s.kind];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setDetail(slotToDetail(s, d.full))}
                      className={`text-left rounded-2xl border p-3 ${meta.tone} hover:opacity-90 transition-opacity`}
                    >
                      <div className="text-[11px] uppercase tracking-widest tabular-nums opacity-80">
                        {s.start}–{s.end}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                        <div className="font-display text-sm font-semibold">
                          {s.title}
                        </div>
                      </div>
                      {s.note && (
                        <div className="text-[11px] opacity-70 mt-1">
                          {s.note}
                        </div>
                      )}
                      <MetaRow price={200} age={meta.age} booking capacity={s.capacity} booked={s.booked} />

                    </button>
                  );
                })}
                {(specialsByDay.get(d.id) ?? []).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setDetail(eventToDetail(e))}
                    className="text-left rounded-2xl border border-dashed border-accent/40 bg-background p-3 hover:bg-accent/5 transition-colors"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-accent flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {e.date} · {e.time}
                    </div>
                    <div className="font-display text-sm font-medium mt-1">
                      {e.title}
                    </div>
                    <div className="text-muted-foreground">
                      <MetaRow price={500} age={e.ageLabel} booking capacity={EVENT_CAPACITY} booked={Math.max(0, EVENT_CAPACITY - e.seatsLeft)} dark />
                    </div>

                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {Object.entries(KIND_META).map(([k, m]) => {
          const Icon = m.icon;
          return (
            <span
              key={k}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${m.tone}`}
            >
              <Icon className="w-3 h-3" strokeWidth={2} /> {m.label}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-accent/40 text-accent">
          <Sparkles className="w-3 h-3" /> Разовое событие
        </span>
      </div>

      <EventDetailDialog event={detail} onClose={() => setDetail(null)} />
    </section>
  );
};

const ModeBtn = ({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon} {children}
  </button>
);

const DayList = ({
  day,
  specials,
  onOpen,
}: {
  day: WeekDayId;
  specials: ClubEvent[];
  onOpen: (d: EventDetail) => void;
}) => {
  const slots = WEEKLY_SCHEDULE[day];
  const dayFull = WEEK_DAYS.find((w) => w.id === day)?.full ?? "";
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft divide-y divide-border">
      {slots.map((s, i) => {
        const meta = KIND_META[s.kind];
        const Icon = meta.icon;
        return (
          <button
            key={i}
            onClick={() => onOpen(slotToDetail(s, dayFull))}
            className="w-full text-left p-4 flex items-start gap-4 hover:bg-secondary/40 transition-colors"
          >
            <div className="w-20 shrink-0">
              <div className="font-display text-base font-semibold tabular-nums">
                {s.start}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                до {s.end}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-widest ${meta.tone}`}
                >
                  <Icon className="w-3 h-3" strokeWidth={2} /> {meta.label}
                </span>
              </div>
              <div className="font-display text-base font-medium mt-1.5">
                {s.title}
              </div>
              {s.note && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.note}
                </div>
              )}
              <div className="text-muted-foreground">
                <MetaRow price={200} age={meta.age} booking capacity={s.capacity} booked={s.booked} dark />
              </div>

            </div>
          </button>
        );
      })}
      {specials.map((e) => (
        <button
          key={e.id}
          onClick={() => onOpen(eventToDetail(e))}
          className="w-full text-left p-4 flex items-start gap-4 bg-accent/5 hover:bg-accent/10 transition-colors"
        >
          <div className="w-20 shrink-0">
            <div className="font-display text-base font-semibold tabular-nums">
              {e.time}
            </div>
            <div className="text-[11px] uppercase tracking-widest text-accent">
              {e.date}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-accent/40 text-accent text-[10px] uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> событие
            </div>
            <div className="font-display text-base font-medium mt-1.5">
              {e.title}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {e.host}
            </div>
            <div className="text-muted-foreground">
              <MetaRow price={500} age={e.ageLabel} booking capacity={EVENT_CAPACITY} booked={Math.max(0, EVENT_CAPACITY - e.seatsLeft)} dark />
            </div>

          </div>
        </button>
      ))}
    </div>
  );
};

const MonthView = ({
  cursor,
  onCursor,
  eventsByDate,
  selectedDate,
  onSelectDate,
  onOpenDetail,
}: {
  cursor: Date;
  onCursor: (d: Date) => void;
  eventsByDate: Map<string, ClubEvent[]>;
  selectedDate: Date | null;
  onSelectDate: (d: Date | null) => void;
  onOpenDetail: (d: EventDetail) => void;
}) => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstOfMonth = new Date(year, month, 1);
  const firstOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - firstOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }

  const shiftMonth = (delta: number) => {
    onCursor(new Date(year, month + delta, 1));
    onSelectDate(null);
  };

  const eventsForDate = (d: Date) =>
    eventsByDate.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? [];

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];
  const selectedDow = selectedDate ? jsDowToWeekDayId(selectedDate.getDay()) : null;
  const selectedSlots = selectedDow ? WEEKLY_SCHEDULE[selectedDow] : [];
  const selectedDayFull = selectedDow
    ? WEEK_DAYS.find((w) => w.id === selectedDow)?.full ?? ""
    : "";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-border">
          <button
            onClick={() => shiftMonth(-1)}
            className="w-9 h-9 rounded-full border border-border inline-flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <div className="font-display text-xl md:text-2xl font-semibold">
              {RU_MONTHS_FULL[month]} {year}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              программа месяца
            </div>
          </div>
          <button
            onClick={() => shiftMonth(1)}
            className="w-9 h-9 rounded-full border border-border inline-flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
          {WEEK_DAYS.map((d) => (
            <div
              key={d.id}
              className="p-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              {d.short}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === month;
            const isToday = d.getTime() === today.getTime();
            const isSelected =
              selectedDate && d.toDateString() === selectedDate.toDateString();
            const dow = jsDowToWeekDayId(d.getDay());
            const slots = WEEKLY_SCHEDULE[dow];
            const evts = eventsForDate(d);
            const total = slots.length + evts.length;
            const kinds = Array.from(new Set(slots.map((s) => s.kind))).slice(0, 3);
            const dayFull = WEEK_DAYS.find((w) => w.id === dow)?.full ?? "";

            const cell = (
              <button
                type="button"
                onClick={() => onSelectDate(isSelected ? null : d)}
                className={`w-full h-full text-left border-r border-b border-border p-1.5 md:p-2 min-h-[68px] md:min-h-[104px] transition-colors relative
                  ${(i + 1) % 7 === 0 ? "border-r-0" : ""}
                  ${i >= 35 ? "border-b-0" : ""}
                  ${inMonth ? "bg-card hover:bg-secondary/40" : "bg-secondary/20 text-muted-foreground/60"}
                  ${isToday ? "ring-1 ring-inset ring-accent" : ""}
                  ${isSelected ? "bg-accent/10" : ""}
                `}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs tabular-nums font-medium
                      ${isToday ? "bg-accent text-accent-foreground" : ""}
                    `}
                  >
                    {d.getDate()}
                  </span>
                  {inMonth && total > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium tabular-nums px-1.5 h-5 rounded-full bg-secondary text-foreground">
                      {total}
                    </span>
                  )}
                </div>

                {inMonth && (
                  <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                    {kinds.map((k) => {
                      const meta = KIND_META[k];
                      const Icon = meta.icon;
                      return (
                        <span
                          key={k}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-md border ${meta.tone}`}
                          title={meta.label}
                        >
                          <Icon className="w-3 h-3" strokeWidth={2} />
                        </span>
                      );
                    })}
                    {evts.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 h-5 rounded-md bg-accent/15 text-accent border border-accent/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        {evts.length}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );

            if (!inMonth || total === 0) return <div key={i} className="contents">{cell}</div>;

            return (
              <HoverCard key={i} openDelay={120} closeDelay={80}>
                <HoverCardTrigger asChild>{cell}</HoverCardTrigger>
                <HoverCardContent
                  align="start"
                  className="w-72 p-0 overflow-hidden"
                >
                  <div className="p-3 border-b border-border bg-secondary/40">
                    <div className="font-display text-base font-semibold">
                      {d.getDate()} {RU_MONTHS_GEN[month]}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {dayFull} · {total} {total === 1 ? "активность" : "активностей"}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {slots.map((s, si) => {
                      const meta = KIND_META[s.kind];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={`s-${si}`}
                          onClick={() => onOpenDetail(slotToDetail(s, dayFull))}
                          className="w-full text-left p-3 flex items-start gap-2.5 hover:bg-secondary/40 transition-colors"
                        >
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 ${meta.tone}`}
                          >
                            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
                              {s.start}–{s.end}
                            </div>
                            <div className="text-sm font-medium leading-tight truncate">
                              {s.title}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {evts.map((e) => (
                      <button
                        key={`e-${e.id}`}
                        onClick={() => onOpenDetail(eventToDetail(e))}
                        className="w-full text-left p-3 flex items-start gap-2.5 bg-accent/5 hover:bg-accent/10 transition-colors"
                      >
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-accent/40 text-accent shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-widest text-accent tabular-nums">
                            событие · {e.time}
                          </div>
                          <div className="text-sm font-medium leading-tight truncate">
                            {e.title}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      </div>

      {selectedDate && selectedDow && (
        <div className="rounded-3xl border border-accent/40 bg-accent/5 p-5 md:p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="font-display text-xl md:text-2xl font-semibold">
                {selectedDate.getDate()} {RU_MONTHS_GEN[selectedDate.getMonth()]}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">
                {selectedDayFull}
              </div>
            </div>
            <button
              onClick={() => onSelectDate(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              закрыть
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedSlots.map((s, i) => {
              const meta = KIND_META[s.kind];
              const Icon = meta.icon;
              return (
                <button
                  key={i}
                  onClick={() => onOpenDetail(slotToDetail(s, selectedDayFull))}
                  className={`text-left rounded-2xl border p-3 ${meta.tone} hover:opacity-90 transition-opacity`}
                >
                  <div className="text-[11px] uppercase tracking-widest tabular-nums opacity-80">
                    {s.start}–{s.end}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                    <div className="font-display text-sm font-semibold">
                      {s.title}
                    </div>
                  </div>
                  {s.note && (
                    <div className="text-[11px] opacity-70 mt-1">{s.note}</div>
                  )}
                </button>
              );
            })}
            {selectedEvents.map((e) => (
              <button
                key={e.id}
                onClick={() => onOpenDetail(eventToDetail(e))}
                className="text-left rounded-2xl border border-dashed border-accent/40 bg-background p-3 hover:bg-accent/5 transition-colors"
              >
                <div className="text-[10px] uppercase tracking-widest text-accent flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> событие · {e.time}
                </div>
                <div className="font-display text-sm font-medium mt-1">
                  {e.title}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {e.host}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubSchedule;
