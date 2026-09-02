import { CalendarDays, Clock, Users, Sparkles, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { KIND_META, type ScheduleKind } from "@/data/clubSchedule";

export const EVENING_PRICE = 200;
export const DAY_PRICE = 150;
export const EVENT_PRICE = 500;

export type EventDetail = {
  id: string;
  slug?: string;
  kind: ScheduleKind | "special";
  title: string;
  description: string;
  dateLabel: string; // "23 мая" or "Каждый вторник"
  time: string;
  duration?: string;
  host?: string;
  ageLabel?: string;
  seatsLeft?: number;
  image?: string;
  note?: string;
};

const KIND_GRADIENT: Record<ScheduleKind | "special", string> = {
  console: "from-accent/40 via-accent/20 to-background",
  board_5: "from-highlight/40 via-highlight/20 to-background",
  board_12: "from-highlight/50 via-highlight/25 to-background",
  board_duo: "from-primary/30 via-primary/10 to-background",
  board_16: "from-primary/40 via-primary/20 to-background",
  special: "from-accent/50 via-primary/20 to-background",
};

const EventDetailDialog = ({
  event,
  onClose,
}: {
  event: EventDetail | null;
  onClose: () => void;
}) => {
  const meta =
    event && event.kind !== "special" ? KIND_META[event.kind] : null;
  const Icon = meta?.icon ?? CalendarDays;
  const gradient = event ? KIND_GRADIENT[event.kind] : "";

  const isSpecial = event?.kind === "special";
  const price = isSpecial ? EVENT_PRICE : EVENING_PRICE;

  const handleBuy = () => {
    if (!event) return;
    toast.success(isSpecial ? "Записали на событие" : "Ждём тебя в клубе", {
      description: `${event.title} · ${price} ₽ · оплата на входе`,
    });
    onClose();
  };

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        {/* Media */}
        <div
          className={`relative h-44 md:h-56 bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          {event?.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon className="w-16 h-16 opacity-40" strokeWidth={1.25} />
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {event?.kind === "special" ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-background/90 text-accent border border-accent/30">
                <Sparkles className="w-3 h-3" /> Разовое событие
              </span>
            ) : meta ? (
              <span
                className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border bg-background/90 ${meta.tone}`}
              >
                <Icon className="w-3 h-3" strokeWidth={2} /> {meta.label}
              </span>
            ) : null}
            {event?.ageLabel && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-background/90 border border-border text-muted-foreground">
                {event.ageLabel}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-display text-2xl leading-tight">
              {event?.title}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> {event?.dateLabel}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {event?.time}
                {event?.duration ? ` · ${event.duration}` : ""}
              </span>
              {event?.host && <span>ведёт {event.host}</span>}
              {typeof event?.seatsLeft === "number" && (
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3" /> осталось {event.seatsLeft}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            {event?.description}
          </p>

          {/* Pricing */}
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent">
                <CreditCard className="w-3 h-3" /> Клубная карта
              </div>
              <div className="font-display text-2xl font-semibold mt-2 flex items-baseline gap-1.5">
                Бесплатно
                <Check className="w-4 h-4 text-accent" />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                Регулярное расписание и события — включено.
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-col">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {isSpecial ? "Разовое событие" : "Разовое участие"}
              </div>
              <div className="font-display text-2xl font-semibold tabular-nums mt-2">
                {price} ₽
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-snug flex-1">
                {isSpecial
                  ? "Спецсобытие с ведущим — нужна запись."
                  : "Оплата за это вечернее занятие. Дневной клуб (08:00–17:00, 150 ₽) оплачивается отдельно — если приходишь только вечером, платить его не нужно. Записываться не надо."}
              </div>
              <Button size="sm" onClick={handleBuy} className="mt-3 w-full">
                {isSpecial ? "Записаться" : "Забронировать место"}
              </Button>
            </div>
          </div>

          {event?.slug && (
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/club/event/${event.slug}`}>Страница события</Link>
              </Button>
            </div>
          )}

          {event?.note && (
            <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
              {event.note}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailDialog;
