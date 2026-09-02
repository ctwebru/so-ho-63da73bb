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
  Check,
  Ban,
  ArrowRight,
  ChevronDown,
  Coffee,
  Smile,
  BookOpen,
  Gamepad2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { BOARD_GAME_GROUPS } from "@/data/boardGames";
import { resolveEvent, nextDateFor, formatRuDate, isBoardGameEvent } from "@/lib/clubEvent";
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
  const boardGames = isBoardGameEvent(event);
  const minimumParticipants = Math.min(4, event.capacity);

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

            {boardGames && (
              <p className="mt-5 max-w-2xl text-lg md:text-2xl text-foreground/80 leading-relaxed text-balance">
                Не знаешь, чем заняться вечером? Мы уже всё придумали: настолки, новые
                знакомства и уютная атмосфера ждут тебя в SO-HO!
              </p>
            )}

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

            {boardGames && (
              <a
                href="#games"
                className="hidden md:inline-flex items-center gap-2 mt-14 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className="w-4 h-4 animate-bounce" />
                Во что играем
              </a>
            )}
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
                hint={
                  soldOut
                    ? "Мест не осталось"
                    : boardGames
                      ? `Минимум ${minimumParticipants} · свободно ${left}`
                      : `Свободно ${left}`
                }
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

        {boardGames && (
          <>
            {/* Как проходит вечер — компактная дорожка */}
            <section className="border-y border-border bg-secondary/40">
              <div className="container mx-auto px-6 py-14 md:py-20">
                <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
                  <p className="text-sm text-muted-foreground mb-3">Вечер без сложных планов</p>
                  <h2 className="font-display text-3xl md:text-5xl font-semibold leading-tight text-balance">
                    Приходи один. Или бери своих.
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StepCard
                    icon={<Coffee className="w-5 h-5" />}
                    step="01"
                    title="Собираемся"
                    text="За 30 минут до игры пьём кофе, знакомимся и выбираем настроение вечера."
                  />
                  <StepCard
                    icon={<BookOpen className="w-5 h-5" />}
                    step="02"
                    title="Объясняем"
                    text="Не знаешь правил — не страшно. Ведущий расскажет всё просто и быстро."
                  />
                  <StepCard
                    icon={<Gamepad2 className="w-5 h-5" />}
                    step="03"
                    title="Играем"
                    text="За вечер успеваем несколько партий. Меняем игры, если захочется."
                  />
                  <StepCard
                    icon={<Smile className="w-5 h-5" />}
                    step="04"
                    title="Уходим довольные"
                    text="Можно уйти раньше — просто предупреди. Или остаться до закрытия."
                  />
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Без алкоголя и курения
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    Напитки можно заказать в кофейне
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    Опыт не нужен
                  </span>
                </div>
              </div>
            </section>

            {/* Каталог игр с табами */}
            <section id="games" className="container mx-auto px-6 py-20 md:py-28">
              <div className="max-w-3xl">
                <p className="text-sm text-muted-foreground mb-3">Игры на ваш выбор</p>
                <h2 className="font-display text-4xl md:text-6xl font-semibold leading-tight text-balance">
                  Во что будем играть?
                </h2>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                  Переключай возрастную группу и смотри, какие игры будут на столах. Не знаешь
                  правил — всё объясним перед первой партией.
                </p>
              </div>

              <Tabs defaultValue={BOARD_GAME_GROUPS[0].age} className="mt-12 md:mt-16">
                <TabsList className="h-auto flex flex-wrap justify-start gap-2 bg-transparent p-0">
                  {BOARD_GAME_GROUPS.map((group) => (
                    <TabsTrigger
                      key={group.age}
                      value={group.age}
                      className="rounded-full border border-border px-5 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                      <span className="font-display text-base font-semibold tabular-nums">{group.age}</span>
                      <span className="ml-2 text-muted-foreground data-[state=active]:text-primary-foreground/80">
                        {group.title}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {BOARD_GAME_GROUPS.map((group) => (
                  <TabsContent
                    key={group.age}
                    value={group.age}
                    className="mt-8 focus-visible:outline-none"
                  >
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.games.map((game) => (
                        <article
                          key={game.title}
                          className="group relative rounded-2xl border border-border bg-card p-6 md:p-7 transition-shadow hover:shadow-soft"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-primary/10 group-hover:bg-primary transition-colors" />
                          <h4 className="font-display text-xl md:text-2xl font-semibold leading-tight">
                            {game.title}
                          </h4>
                          <p className="mt-4 text-base font-medium leading-snug">{game.hook}</p>
                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                            {game.description}
                          </p>
                        </article>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            <section className="bg-primary text-primary-foreground">
              <div className="container mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="max-w-2xl">
                  <p className="text-sm text-primary-foreground/65 mb-3">Осталось выбрать вечер</p>
                  <h2 className="font-display text-4xl md:text-6xl font-semibold leading-tight text-balance">
                    Записывайся. Будем уютно играть.
                  </h2>
                  <p className="mt-5 text-primary-foreground/75">
                    Можно прийти без компании — познакомим и поможем включиться в игру.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={soldOut}
                  onClick={() => setOpen(true)}
                  className="shrink-0"
                >
                  {soldOut ? "Мест нет" : "Забронировать место"}
                  {!soldOut && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </section>
          </>
        )}
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 rounded-full"
                  onClick={() => setPeople((p) => Math.max(1, p - 1))}
                  aria-label="Уменьшить количество гостей"
                >
                  −
                </Button>
                <span className="tabular-nums w-4 text-center">{people}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 rounded-full"
                  onClick={() => setPeople((p) => Math.min(left || 1, p + 1))}
                  aria-label="Увеличить количество гостей"
                >
                  +
                </Button>
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

const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-background p-6 md:p-8">
    <h3 className="font-display text-xl font-semibold mb-6">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const InfoLine = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3 text-sm leading-relaxed">
    <Check className="w-4 h-4 mt-0.5 text-accent shrink-0" />
    <span>{children}</span>
  </div>
);

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div>
    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-display text-xl md:text-2xl font-semibold mt-1">{value}</div>
    {hint && <p className="text-xs text-muted-foreground mt-2 max-w-xs">{hint}</p>}
  </div>
);

export default ClubEvent;
