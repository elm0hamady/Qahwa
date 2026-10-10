import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Coffee, Swords } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { InlineBanner } from "@/components/common/InlineBanner";
import { Seo } from "@/components/common/Seo";
import { useTopics } from "@/features/topics/hooks";
import { useCreateSession } from "@/features/sessions/hooks";
import { getTopicIcon } from "@/features/game/topicIcons";
import { normalizeError } from "@/lib/errors";
import { cn } from "@/lib/cn";

const REQUIRED_TOPICS = 4;

export function NewGamePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: topics, isLoading, isError, error, refetch } = useTopics({ search: search || undefined });
  const createSession = useCreateSession();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof topics>();
    for (const topic of topics ?? []) {
      const list = map.get(topic.category) ?? [];
      list.push(topic);
      map.set(topic.category, list);
    }
    return Array.from(map.entries());
  }, [topics]);

  function toggleTopic(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((topicId) => topicId !== id);
      if (prev.length >= REQUIRED_TOPICS) return prev;
      return [...prev, id];
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!player1.trim() || !player2.trim()) {
      setFormError("لازم اسم لكل فريق.");
      return;
    }
    if (selected.length !== REQUIRED_TOPICS) {
      setFormError(`اختار ${REQUIRED_TOPICS} مواضيع بالظبط — عندك دلوقتي ${selected.length}.`);
      return;
    }

    createSession.mutate(
      { player1_name: player1.trim(), player2_name: player2.trim(), topic_ids: selected },
      {
        onSuccess: (session) => navigate(`/games/${session.id}`),
      }
    );
  }

  const apiError = createSession.isError ? normalizeError(createSession.error) : null;

  return (
    <PageContainer>
      <Seo title="ابدأ لعبة جديدة" path="/games/new" noIndex />
      <div className="mx-auto w-full max-w-[88rem]">
        <header className="mb-7 border-b border-border-soft pb-5 sm:mb-9 sm:pb-7">
          <p className="text-sm font-bold text-orange">قهوة · تجهيز المواجهة</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink text-balance sm:text-4xl">
            جهّزوا الطاولة
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-mute sm:text-base">
            سمّوا الفريقين واختاروا أربعة مواضيع لبداية الجولة.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
          <section aria-label="أسماء الفريقين" className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="relative border border-purple/30 bg-surface p-4 sm:p-6">
              <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1 bg-purple" />
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-purple/30 bg-purple-dim text-purple">
                  <Swords size={18} aria-hidden="true" />
                </span>
                <label htmlFor="player1_name" className="font-display text-lg font-extrabold text-ink">
                  الفريق الأول
                </label>
              </div>
              <Input
                id="player1_name"
                name="player1_name"
                autoComplete="off"
                spellCheck={false}
                placeholder="اسم الفريق الأول"
                value={player1}
                onChange={(event) => setPlayer1(event.target.value)}
                className="rounded-none border border-border-soft bg-bg-soft focus:border-purple"
              />
            </div>
            <div className="relative border border-orange/30 bg-surface p-4 sm:p-6">
              <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1 bg-orange" />
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-orange/30 bg-orange-dim text-orange">
                  <Coffee size={18} aria-hidden="true" />
                </span>
                <label htmlFor="player2_name" className="font-display text-lg font-extrabold text-ink">
                  الفريق الثاني
                </label>
              </div>
              <Input
                id="player2_name"
                name="player2_name"
                autoComplete="off"
                spellCheck={false}
                placeholder="اسم الفريق الثاني"
                value={player2}
                onChange={(event) => setPlayer2(event.target.value)}
                className="rounded-none border border-border-soft bg-bg-soft focus:border-orange"
              />
            </div>
          </section>

          <section aria-labelledby="choose-topics-title" className="border border-border-soft bg-surface p-4 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-border-soft pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="choose-topics-title" className="font-display text-xl font-extrabold text-ink">
                  اختاروا المواضيع
                </h2>
                <p className="mt-1 text-sm text-ink-mute">اختاروا أربعة مواضيع للجولة.</p>
              </div>
              <span
                aria-live="polite"
                aria-atomic="true"
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 self-start border px-3 text-sm font-bold tabular-nums sm:self-auto",
                  selected.length === REQUIRED_TOPICS
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border-soft bg-bg-soft text-ink-dim"
                )}
              >
                {selected.length === REQUIRED_TOPICS && <Check size={15} aria-hidden="true" />}
                {selected.length} / {REQUIRED_TOPICS} مختارة
              </span>
            </div>

            <div className="mt-4">
              <Input
                label="ابحث عن موضوع"
                name="topic_search"
                autoComplete="off"
                placeholder="دور على موضوع…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-none border border-border-soft bg-bg-soft focus:border-orange"
              />
            </div>

            <div className="mt-5">
              {isLoading && <Spinner label="بيحمّل المواضيع…" />}
              {isError && <ErrorState message={normalizeError(error).message} onRetry={() => refetch()} />}
              {!isLoading && !isError && (topics?.length ?? 0) === 0 && (
                <EmptyState
                  title="مفيش مواضيع"
                  description="جرّب كلمة بحث تانية، أو اطلب من الأدمن يضيف أسئلة أكتر للبنك."
                />
              )}
              {!isLoading && !isError && grouped.length > 0 && (
                <div className="flex flex-col gap-6">
                  {grouped.map(([category, items]) => (
                    <section key={category} aria-label={category}>
                      <h3 className="mb-3 border-s-2 border-orange ps-3 text-sm font-bold text-ink-dim">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {(items ?? []).map((topic) => {
                          const isSelected = selected.includes(topic.id);
                          const isDisabled = !isSelected && selected.length >= REQUIRED_TOPICS;
                          const Icon = getTopicIcon(topic.name, topic.category);

                          return (
                            <button
                              type="button"
                              key={topic.id}
                              disabled={isDisabled}
                              onClick={() => toggleTopic(topic.id)}
                              aria-pressed={isSelected}
                              className={cn(
                                "flex min-h-14 min-w-0 items-center gap-2 border px-3 py-2 text-start text-sm font-bold transition-[border-color,background-color,color,opacity] duration-150",
                                isSelected
                                  ? "border-orange/70 bg-orange-dim text-orange"
                                  : "border-border-soft bg-bg-soft text-ink-dim hover:border-orange/50 hover:bg-surface-hi hover:text-ink",
                                isDisabled && "cursor-not-allowed opacity-45 hover:border-border-soft hover:bg-bg-soft hover:text-ink-dim"
                              )}
                            >
                              <Icon size={17} className="shrink-0 text-orange" aria-hidden="true" />
                              <span className="min-w-0 flex-1 break-words">{topic.name}</span>
                              {isSelected && <Check size={15} className="shrink-0" aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </section>

          {(formError || apiError) && (
            <div role="alert">
              <InlineBanner message={formError ?? apiError!.message} />
            </div>
          )}

          <div className="flex justify-stretch border-t border-border-soft pt-5 sm:justify-end">
            <Button
              type="submit"
              size="lg"
              loading={createSession.isPending}
              className="min-h-14 w-full px-8 text-base sm:w-auto"
            >
              ابدأ المبارزة
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
