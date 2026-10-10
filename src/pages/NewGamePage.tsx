import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { InlineBanner } from "@/components/common/InlineBanner";
import { Seo } from "@/components/common/Seo";
import { useTopics } from "@/features/topics/hooks";
import { useCreateSession } from "@/features/sessions/hooks";
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
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= REQUIRED_TOPICS) return prev;
      return [...prev, id];
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <Input
            label="الفريق الأول"
            name="player1_name"
            autoComplete="off"
            spellCheck={false}
            placeholder="اسم الفريق الأول"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="focus:border-purple"
          />
          <Input
            label="الفريق الثاني"
            name="player2_name"
            autoComplete="off"
            spellCheck={false}
            placeholder="اسم الفريق الثاني"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">اختار 4 مواضيع</h2>
              <p className="text-sm text-ink-mute">هنا بس المواضيع اللي فيها بنك أسئلة كامل.</p>
            </div>
            <span
              aria-live="polite"
              aria-atomic="true"
              className={cn(
                "self-start rounded-full border px-3 py-1 text-sm font-medium sm:self-auto",
                selected.length === REQUIRED_TOPICS
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border text-ink-mute"
              )}
            >
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
              onChange={(e) => setSearch(e.target.value)}
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
              <div className="flex flex-col gap-5">
                {grouped.map(([category, items]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-xs font-semibold tracking-wide text-ink-mute">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(items ?? []).map((topic) => {
                        const isSelected = selected.includes(topic.id);
                        const isDisabled = !isSelected && selected.length >= REQUIRED_TOPICS;
                        return (
                          <button
                            type="button"
                            key={topic.id}
                            disabled={isDisabled}
                            onClick={() => toggleTopic(topic.id)}
                            aria-pressed={isSelected}
                            className={cn(
                              "flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors",
                              isSelected
                                ? "border-purple bg-purple/15 text-purple"
                                : "border-border text-ink-dim hover:border-purple/50 hover:text-ink",
                              isDisabled && "cursor-not-allowed opacity-50 hover:border-border hover:text-ink-dim"
                            )}
                          >
                            {isSelected && <Check size={13} aria-hidden="true" />}
                            {topic.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {(formError || apiError) && (
          <div>
            <InlineBanner message={formError ?? apiError!.message} />
          </div>
        )}

        <Button type="submit" size="lg" loading={createSession.isPending} className="w-full sm:w-auto sm:self-start">
          ابدأ المبارزة
        </Button>
      </form>
    </PageContainer>
  );
}
