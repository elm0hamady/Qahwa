import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Seo } from "@/components/common/Seo";
import { useTopics } from "@/features/topics/hooks";
import { getTopicIcon } from "@/features/game/topicIcons";
import { normalizeError } from "@/lib/errors";

const TOPIC_TONES = [
  { icon: "border-orange/35 bg-orange/10 text-orange", wash: "from-orange/10" },
  { icon: "border-purple/35 bg-purple/10 text-purple", wash: "from-purple/10" },
  { icon: "border-cyan/35 bg-cyan-dim text-cyan", wash: "from-cyan/10" },
  { icon: "border-success/35 bg-success/10 text-success", wash: "from-success/10" },
] as const;

function getToneIndex(value: string): number {
  return Array.from(value).reduce((sum, character) => sum + character.charCodeAt(0), 0) % TOPIC_TONES.length;
}

export function TopicsPage() {
  const [search, setSearch] = useState("");
  const reduceMotion = useReducedMotion();
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
      <div className="mx-auto w-full max-w-[88rem]">
        <div className="mb-8 border border-border-soft bg-surface p-4 sm:p-5">
          <Input
            label="ابحث عن موضوع"
            name="topic_search"
            autoComplete="off"
            placeholder="دور على موضوع…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-12 rounded-none border border-border-soft bg-bg-soft focus:border-orange"
          />
        </div>

        {isLoading && <Spinner label="بيحمّل المواضيع…" />}
        {isError && <ErrorState message={normalizeError(error).message} onRetry={() => refetch()} />}
        {!isLoading && !isError && (topics?.length ?? 0) === 0 && (
          <EmptyState
            title="مفيش مواضيع"
            description="جرّب كلمة بحث تانية، أو اطلب من الأدمن يضيف أسئلة أكتر للبنك."
          />
        )}
        {!isLoading && !isError && grouped.length > 0 && (
          <div className="flex flex-col gap-10">
            {grouped.map(([category, items], categoryIndex) => {
              return (
                <section key={category} aria-labelledby={`topic-category-${categoryIndex}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-7 w-1 bg-orange" aria-hidden="true" />
                    <h2
                      id={`topic-category-${categoryIndex}`}
                      className="font-display text-xl font-extrabold text-ink sm:text-2xl"
                    >
                      {category}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {(items ?? []).map((topic, index) => {
                      const Icon = getTopicIcon(topic.name, topic.category);
                      const tone = TOPIC_TONES[(getToneIndex(category) + index) % TOPIC_TONES.length];
                      return (
                        <motion.div
                          key={topic.id}
                          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: reduceMotion ? 0 : 0.25,
                            delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.21),
                          }}
                          className="min-w-0"
                        >
                          <div className="group relative isolate flex min-h-36 items-end overflow-hidden border border-border-soft bg-surface p-4 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-1 hover:border-orange/40 hover:bg-surface-hi sm:min-h-40 sm:p-5">
                            <div
                              aria-hidden="true"
                              className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${tone.wash} via-transparent to-transparent opacity-75`}
                            />
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute -end-5 -top-7 h-24 w-24 rotate-12 border border-border-soft/70 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110"
                            />
                            <span
                              className={`absolute end-4 top-4 flex h-11 w-11 items-center justify-center border ${tone.icon} transition-transform duration-200 group-hover:-rotate-6 sm:end-5 sm:top-5`}
                            >
                              {/* oxlint-disable-next-line react-hooks/static-components */}
                              <Icon size={20} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 break-words font-display text-base font-extrabold leading-snug text-ink sm:text-lg">
                              {topic.name}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
