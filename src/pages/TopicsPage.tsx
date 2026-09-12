import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Seo } from "@/components/common/Seo";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useTopics } from "@/features/topics/hooks";
import { getTopicIcon } from "@/features/game/topicIcons";
import { normalizeError } from "@/lib/errors";

export function TopicsPage() {
  const [search, setSearch] = useState("");
  const { data: topics, isLoading, isError, error, refetch } = useTopics({ search: search || undefined });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof topics>();
    for (const topic of topics ?? []) {
      const list = map.get(topic.category) ?? [];
      list.push(topic);
      map.set(topic.category, list);
    }
    return Array.from(map.entries());
  }, [topics]);

  return (
    <PageContainer>
      <Seo
        title="بنك المواضيع"
        description="كل المواضيع الجاهزة في بنك الأسئلة بتاع قهوة."
        path="/topics"
        noIndex
      />
      <Breadcrumbs items={[{ label: "لوحة التحكم", path: "/dashboard" }, { label: "المواضيع" }]} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="font-display text-3xl font-bold text-ink text-balance">بنك المواضيع</h1>
        <p className="mt-1 text-ink-mute">كل المواضيع الجاهزة اللي تقدر تختار منها لما تبدأ لعبة جديدة.</p>
      </motion.div>

      <Card className="mt-8 p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-mute" size={16} />
          <Input
            placeholder="دور على موضوع…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>

        <div className="mt-6">
          {isLoading && <Spinner label="بيحمّل المواضيع…" />}
          {isError && <ErrorState message={normalizeError(error).message} onRetry={() => refetch()} />}
          {!isLoading && !isError && (topics?.length ?? 0) === 0 && (
            <EmptyState
              title="مفيش مواضيع"
              description="جرّب كلمة بحث تانية، أو اطلب من الأدمن يضيف أسئلة أكتر للبنك."
            />
          )}
          {!isLoading && !isError && grouped.length > 0 && (
            <div className="flex flex-col gap-8">
              {grouped.map(([category, items]) => (
                <div key={category}>
                  <h2 className="mb-3 text-xs font-semibold tracking-wide text-ink-mute">{category}</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {(items ?? []).map((topic, i) => {
                      const Icon = getTopicIcon(topic.name, topic.category);
                      return (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, y: 12, scale: 0.92 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ type: "spring", stiffness: 320, damping: 24, delay: (i % 12) * 0.03 }}
                        >
                          <Card className="flex flex-col items-center gap-2 p-4 text-center transition-colors hover:border-purple">
                            <span className="flex h-11 w-11 items-center justify-center rounded-token border-2 border-purple bg-purple-dim text-purple">
                              {/* oxlint-disable-next-line react-hooks/static-components */}
                              <Icon size={18} />
                            </span>
                            <span className="text-sm font-bold text-ink">{topic.name}</span>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
