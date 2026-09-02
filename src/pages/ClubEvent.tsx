import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Share2,
  Sparkles,
  Check,
  Ban,
  ArrowRight,
  ChevronDown,
  Coffee,
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
import { BOARD_GAME_GROUPS, cascadeGames, type CascadedGame } from "@/data/boardGames";
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
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Левая колонка: о встрече и правила */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold">О встрече</h2>
                <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/40 p-6 md:p-8 space-y-5">
                <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  Правила посещения
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                    <p className="text-sm leading-relaxed">
                      Приходите за 30 минут до начала — успеете выбрать игру, заказать напитки и
                      познакомиться с соседями.
                    </p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                    <p className="text-sm leading-relaxed">
                      Минимум {minimumParticipants} участника для проведения встречи.
                    </p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                    <p className="text-sm leading-relaxed">
                      Максимальная вместимость — {event.capacity} гостей, чтобы всем было комфортно.
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Правая колонка: бронирование */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-24 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Стоимость
                  </p>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-display text-3xl font-semibold">{event.price} ₽</span>
                    <span className="text-xs text-muted-foreground">
                      по клубной карте — бесплатно
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Статус записи
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">
                      {left} {left === 1 ? "место" : left < 5 ? "места" : "мест"} доступно
                    </span>
                    {!soldOut && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                        Открыта
                      </span>
                    )}
                    {soldOut && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                        Заполнено
                      </span>
                    )}
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.min(100, Math.round((event.booked / event.capacity) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 tabular-nums">
                    Записались {event.booked} из {event.capacity}
                  </p>
                </div>

                <div className="flex gap-6 md:gap-8 border-t border-border pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                      Запись
                    </p>
                    <p className="text-sm font-medium">
                      {event.booking ? "Нужна бронь" : "Без записи"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                      Длительность
                    </p>
                    <p className="text-sm font-medium">{event.duration ?? event.time}</p>
                  </div>
                  {event.recurring && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Повтор
                      </p>
                      <p className="text-sm font-medium">{event.dateLabel}</p>
                    </div>
                  )}
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
          </div>
        </section>

        {boardGames && (
          <>
            {/* Краткие правила вечера */}
            <section className="border-y border-border bg-secondary/40">
              <div className="container mx-auto px-6 py-8">
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Без алкоголя и курения
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-accent" />
                    Напитки из кофейни
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    Опыт не нужен
                  </span>
                </div>
              </div>
            </section>

            {/* Каталог игр с каскадными табами */}
            <section id="games" className="container mx-auto px-6 py-20 md:py-28">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
                <div className="max-w-2xl">
                  <p className="text-sm text-muted-foreground mb-3">Игры на ваш выбор</p>
                  <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-balance">
                    Во что играем?
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    Библиотека из 40+ игр. Переключай возрастную группу — в старших табах
                    автоматически появляются и младшие игры.
                  </p>
                </div>
              </div>

              <Tabs defaultValue={BOARD_GAME_GROUPS[0].age} className="w-full">
                <TabsList className="h-auto w-full md:w-auto flex flex-wrap justify-start gap-2 bg-transparent p-0 mb-8 md:mb-10">
                  {BOARD_GAME_GROUPS.map((group) => (
                    <TabsTrigger
                      key={group.age}
                      value={group.age}
                      className="rounded-full border border-border px-5 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-none transition-all"
                    >
                      <span className="font-display text-base font-semibold tabular-nums">
                        {group.age}
                      </span>
                      <span className="ml-2 text-muted-foreground data-[state=active]:text-primary-foreground/80">
                        {group.title}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {BOARD_GAME_GROUPS.map((group) => {
                  const games = cascadeGames(group.age);
                  return (
                    <TabsContent
                      key={group.age}
                      value={group.age}
                      className="mt-0 focus-visible:outline-none"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                        {games.map((game, idx) => (
                          <GameCard key={`${game.title}-${idx}`} game={game} />
                        ))}
                      </div>

                      <div className="mt-12 text-center">
                        <p className="text-sm text-muted-foreground/70 italic">
                          + ещё игры в коллекции клуба — ведущий подберёт под настроение вечера
                        </p>
                      </div>
                    </TabsContent>
                  );
                })}
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


const GAME_BACKGROUNDS = [
  "radial-gradient(circle at 30% 30%, hsl(90 18% 88%), hsl(110 16% 80%))",
  "radial-gradient(circle at 30% 30%, hsl(75 16% 88%), hsl(95 14% 80%))",
  "radial-gradient(circle at 30% 30%, hsl(110 14% 86%), hsl(130 12% 78%))",
  "radial-gradient(circle at 30% 30%, hsl(80 15% 89%), hsl(100 13% 81%))",
  "radial-gradient(circle at 30% 30%, hsl(120 12% 86%), hsl(140 10% 78%))",
];

const GameCard = ({ game }: { game: CascadedGame }) => {
  const initials = game.title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const bgIndex = game.title.length % GAME_BACKGROUNDS.length;

  return (
    <article className="group cursor-pointer">
      <div className="aspect-[3/4] rounded-2xl mb-3 overflow-hidden border border-border bg-secondary transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-soft">
        <div
          className="w-full h-full flex items-center justify-center p-6"
          style={{ background: GAME_BACKGROUNDS[bgIndex] }}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-foreground/10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="font-display text-2xl md:text-3xl font-semibold text-foreground/40">
              {initials || "?"}
            </span>
          </div>
        </div>
      </div>
      <h4 className="font-display text-base md:text-lg font-semibold leading-tight group-hover:text-accent transition-colors">
        {game.title}
      </h4>
      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{game.hook}</p>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {game.age}
      </p>
    </article>
  );
};

export default ClubEvent;
