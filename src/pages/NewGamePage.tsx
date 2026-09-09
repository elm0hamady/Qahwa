import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { InlineBanner } from "@/components/common/InlineBanner";
import { Seo } from "@/components/common/Seo";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
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
      setFormError("لازم اسم لكل لاعب.");
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
      <Breadcrumbs items={[{ label: "لوحة التحكم", path: "/dashboard" }, { label: "لعبة جديدة" }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="font-display text-3xl font-semibold text-ink text-balance">جهّز الطاولة</h1>
        <p className="mt-1 text-ink-mute">لاعبين اتنين، أربعة مواضيع. اللوحة هتتظبط لوحدها بعد كده.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <Input
            label="اللاعب الأول"
            placeholder="مثلاً يوسف"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="focus:border-purple"
          />
          <Input
            label="اللاعب الثاني"
            placeholder="مثلاً نور"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
          />
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">اختار 4 مواضيع</h2>
              <p className="text-sm text-ink-mute">هنا بس المواضيع اللي فيها بنك أسئلة كامل.</p>
            </div>
            <span
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

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-mute" size={16} />
            <Input
              placeholder="دور على موضوع…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
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
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                              isSelected
                                ? "border-purple bg-purple/15 text-purple"
                                : "border-border text-ink-dim hover:border-purple/50 hover:text-ink",
                              isDisabled && "cursor-not-allowed opacity-40 hover:border-border hover:text-ink-dim"
                            )}
                          >
                            {isSelected && <Check size={13} />}
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

        {(formError || apiError) && <InlineBanner message={formError ?? apiError!.message} />}

        <Button type="submit" size="lg" loading={createSession.isPending} className="self-start">
          ابدأ المبارزة
        </Button>
      </form>
    </PageContainer>
  );
}
