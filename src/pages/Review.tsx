import { useState } from "react";
import { Star, Coffee, Laptop, ArrowLeft, Gift, ExternalLink, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Area = "cafe" | "cowork";
type Step = "rate" | "form" | "praise" | "done";

const GIS_URL = "https://2gis.ru/novosibirsk";

const Review = () => {
  const [step, setStep] = useState<Step>("rate");
  const [area, setArea] = useState<Area>("cafe");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);

  const pickRating = (value: number) => {
    setRating(value);
    setStep(value <= 3 ? "form" : "praise");
  };

  const submitFeedback = async () => {
    if (!message.trim()) {
      toast.error("Напишите пару слов — нам важно понять, что пошло не так");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("feedback").insert({
      area,
      rating,
      message: message.trim().slice(0, 1000),
      contact: contact.trim().slice(0, 200) || null,
    });
    setSending(false);
    if (error) {
      toast.error("Не получилось отправить. Попробуйте ещё раз");
      return;
    }
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto px-5 py-10 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">SO-HO!</p>
          <h1 className="font-display text-2xl font-semibold">Как вам у нас?</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Покажите отзыв бариста — и получите сладкий комплимент
          </p>
        </div>

        {/* Area switch */}
        {step !== "done" && (
          <div className="grid grid-cols-2 gap-2 mb-8">
            {(
              [
                { id: "cafe" as Area, label: "Кофейня", icon: Coffee },
                { id: "cowork" as Area, label: "Коворкинг", icon: Laptop },
              ]
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setArea(id)}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                  area === id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Step: rating */}
        {step === "rate" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <p className="text-center text-muted-foreground text-sm">
              Поставьте оценку {area === "cafe" ? "кофейне" : "коворкингу"}
            </p>
            <div className="flex gap-2" onMouseLeave={() => setHovered(0)}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  aria-label={`${v} из 5`}
                  onMouseEnter={() => setHovered(v)}
                  onClick={() => pickRating(v)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    className={`w-11 h-11 transition-colors ${
                      v <= (hovered || rating)
                        ? "fill-accent text-accent"
                        : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: 1-3 stars — form to manager */}
        {step === "form" && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setStep("rate")}
              className="flex items-center gap-1 text-sm text-muted-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Изменить оценку
            </button>

            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star
                  key={v}
                  className={`w-5 h-5 ${v <= rating ? "fill-accent text-accent" : "text-border"}`}
                />
              ))}
            </div>

            <h2 className="font-display text-xl font-semibold mb-1">
              Нам жаль, что так вышло
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Расскажите, что случилось — сообщение уйдёт напрямую руководителю,
              и мы обязательно разберёмся.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Что пошло не так?"
              className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring mb-3"
            />
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={200}
              placeholder="Телеграм или телефон (необязательно)"
              className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-6"
            />

            <button
              onClick={submitFeedback}
              disabled={sending}
              className="mt-auto w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-medium py-4 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? "Отправляем…" : "Отправить руководителю"}
            </button>
          </div>
        )}

        {/* Step: 4-5 stars — redirect to 2GIS */}
        {step === "praise" && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setStep("rate")}
              className="flex items-center gap-1 text-sm text-muted-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Изменить оценку
            </button>

            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star
                  key={v}
                  className={`w-5 h-5 ${v <= rating ? "fill-accent text-accent" : "text-border"}`}
                />
              ))}
            </div>

            <h2 className="font-display text-xl font-semibold mb-1">
              Спасибо, очень приятно!
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Поделитесь тёплыми словами на 2ГИС — это очень помогает соседям нас находить.
            </p>

            <a
              href={GIS_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-medium py-4 mb-4"
            >
              Оставить отзыв на 2ГИС
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-4 flex items-start gap-3">
              <Gift className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm">
                Покажите опубликованный отзыв бариста — угостим сладким комплиментом к кофе.
              </p>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Сообщение у руководителя</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Спасибо за честность. Мы разберёмся и, если оставили контакт, свяжемся с вами лично.
            </p>
            <button
              onClick={() => {
                setStep("rate");
                setRating(0);
                setMessage("");
                setContact("");
              }}
              className="text-sm text-accent font-medium mt-2"
            >
              Оставить ещё один отзыв
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
