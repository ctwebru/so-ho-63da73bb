import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Coins,
  Users,
  ClipboardCheck,
  Share2,
  MapPin,
  Sparkles,
} from "lucide-react";
import Navigation from "@/components/flow/Navigation";
import Footer from "@/components/flow/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { KIND_META } from "@/data/clubSchedule";
import { resolveEvent, nextDateFor, formatRuDate } from "@/lib/clubEvent";
import clubPhoto from "@/assets/real/club-front.png";

const ClubEvent = () => {
  const { slug = "" } = useParams();
  const event = resolveEvent(slug);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(1);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-6 pt-40 pb-24 text-center">
          <h1 className="font-display text-4xl font-semibold">Событие не найдено</h1>
          <p className="text-muted-foreground mt-3">
            Возможно, оно уже прошло или ссылка устарела.
          </p>
          <Button asChild className="mt-6">
            <Link to="/club">Смотреть расписание</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const meta = event.kind !== "special" ? KIND_META[event.kind] : null;
  const Icon = meta?.icon ?? Sparkles;
  const left = Math.max(0, event.capacity - event.booked);
  const soldOut = left === 0;
  const nearest =
    event.recurring && event.weekDay ? formatRuDate(nextDateFor(event.weekDay)) : event.dateLabel;

  const share = async () => {
    const url = window.location.href;
    const data = { title: `${event.title} — Соседский клуб SO-HO!`, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* отменили — падаем в копирование */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Ссылка скопирована");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 6) {
      toast.error("Оставь имя и телефон — мы подтвердим бронь");
      return;
    }
    setOpen(false);
    toast.success("Место забронировано", {
      description: `${event.title} · ${nearest} · ${event.time} · ${people} чел.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {/* HERO */}
        <section className="relative min-h-[85vh] flex items-end overflow-hidden">
          <img
            src={clubPhoto}
            alt="Соседский клуб SO-HO! в Новосибирске"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />

          <div className="relative container mx-auto px-6 pt-32 pb-14">
            <Link
              to="/club"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Соседский клуб
            </Link>

            <div className="flex flex-wrap items-center gap-2 mt-6">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full border ${
                  meta ? meta.tone : "border-accent/40 text-accent bg-accent/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {meta ? meta.label : "Разовое событие"}
              </span>
              {event.age && (
                <span className="text-[11px] uppercase tracking-widest px-3 py-1 rounded-full border border-border text-muted-foreground">
                  {event.age}
                </span>
              )}
              {event.recurring && (
                <span className="text-[11px] uppercase tracking-widest px-3 py-1 rounded-full border border-border text-muted-foreground">
                  каждую неделю
                </span>
              )}
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] mt-5 max-w-4xl text-balance">
              {event.title}
            </h1>

            {/* Крупная дата и время */}
            <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {event.recurring ? "Ближайшая встреча" : "Дата"}
                </div>
                <div className="font-display text-4xl md:text-5xl font-semibold tabular-nums leading-none mt-1">
                  {nearest}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Время
                </div>
                <div className="font-display text-4xl md:text-5xl font-semibold tabular-nums leading-none mt-1">
                  {event.time}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" disabled={soldOut} onClick={() => setOpen(true)}>
                {soldOut ? "Мест нет" : "Забронировать место"}
              </Button>
              <Button size="lg" variant="outline" onClick={share}>
                <Share2 className="w-4 h-4" /> Поделиться
              </Button>
            </div>
          </div>
        </section>

        {/* Детали */}
        <section className="container mx-auto px-6 py-16 md:py-24 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7 space-y-6">
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
              {event.description}
            </p>
            {event.host && (
              <p className="text-sm text-muted-foreground">Ведёт: {event.host}</p>
            )}
            <div className="flex items-start gap-2 text-sm text-muted-foreground border-t border-border pt-6">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Новосибирск, Дачное шоссе, 22/3 — соседский клуб SO-HO! на территории ЖК
                Flora&nbsp;&amp;&nbsp;Fauna. Клуб открыт ежедневно 08:00 — 20:00.
              </span>
            </div>
          </div>

          <aside className="md:col-span-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-5">
              <Row
                icon={<Coins className="w-4 h-4" />}
                label="Стоимость"
                value={`${event.price} ₽`}
                hint="По клубной карте — бесплатно"
              />
              <Row
                icon={<Users className="w-4 h-4" />}
                label="Максимум участников"
                value={`${event.capacity} человек`}
                hint={soldOut ? "Мест не осталось" : `Свободно ${left}`}
              />
              <Row
                icon={<ClipboardCheck className="w-4 h-4" />}
                label="Запись"
                value={event.booking ? "Нужна бронь" : "Без записи"}
              />
              <Row
                icon={<Clock className="w-4 h-4" />}
                label="Продолжительность"
                value={event.duration ?? event.time}
              />
              {event.recurring && (
                <Row
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Повторяется"
                  value={event.dateLabel}
                />
              )}

              <div className="pt-2">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.min(100, Math.round((event.booked / event.capacity) * 100))}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2 tabular-nums">
                  Записались {event.booked} из {event.capacity}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={soldOut}
                onClick={() => setOpen(true)}
              >
                {soldOut ? "Мест нет" : "Забронировать место"}
              </Button>
            </div>
          </aside>
        </section>
      </main>

      <Footer />

      {/* Липкая кнопка на мобильном */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-4 bg-background/90 backdrop-blur border-t border-border">
        <Button className="w-full" size="lg" disabled={soldOut} onClick={() => setOpen(true)}>
          {soldOut ? "Мест нет" : `Забронировать · ${event.price} ₽`}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Бронь места</DialogTitle>
            <DialogDescription>
              {event.title} · {nearest} · {event.time}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="Телефон"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Сколько вас</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-border"
                  onClick={() => setPeople((p) => Math.max(1, p - 1))}
                >
                  −
                </button>
                <span className="tabular-nums w-4 text-center">{people}</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-border"
                  onClick={() => setPeople((p) => Math.min(left || 1, p + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Забронировать
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Оплата на месте · по клубной карте бесплатно
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Row = ({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 text-muted-foreground">{icon}</span>
    <div className="flex-1">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-lg font-medium leading-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  </div>
);

export default ClubEvent;
