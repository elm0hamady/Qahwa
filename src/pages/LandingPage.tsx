import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownLeft, ArrowUpLeft, Clapperboard, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Seo } from "@/components/common/Seo";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { useAuthStore } from "@/features/auth/store";
import { getTopicIcon } from "@/features/game/topicIcons";

const EXAMPLE_TOPICS = [
  "تاريخ",
  "كورة",
  "بنات وبس",
  "طبخ",
  "جغرافيا",
  "انمى",
  "معلومات عامة",
  "رياضات الكترونية",
];

const HOW_TO_PLAY = [
  "كل لاعب بيختار موضوعين من اللى هو قوى فيهم وله 3 اسئلة فى كل موضوع من سهل لصعب",
  "كل لاعب له دور بيختار سؤال فى موضوع يختاره بالمستوى اللى يفضله له دقيقة يجاوب ثم يجاوب اللاعب التانى",
  "الحكم هو المتحكم فى الدور يقول مين اللى عليه الدور ومين جاوب صح ومين ياخد النقط",
  "الحكم له الحق انه يزود نقط لو الاجابة عجبته او ينقص لو اى لاعب تجاوز",
  "الفائز صاحب اعلى نقط",
] as const;

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/favicon.svg"),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      description: "مبارزة أسئلة مباشرة بين لاعبين، يديرها المضيف من اختيار المواضيع حتى النتيجة النهائية.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ];

  const primaryRoute = isAuthenticated ? "/games/new" : "/login";
  const primaryLabel = "العب دلوقتى";

  return (
    <>
      <Seo
        title="قهوة — ساحة مبارزات الأسئلة"
        description="لعبة جماعية تلعبها مع اهلك واصحابك على القهوة مكونة من 4 مواضيع يختارها اللاعبين"
        path="/"
        jsonLd={jsonLd}
      />

      <section className="relative isolate min-h-[calc(100svh-4.25rem)] overflow-hidden border-b border-border-soft">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(5, 7, 10, 0.76) 0%, rgba(5, 7, 10, 0.56) 42%, rgba(5, 7, 10, 0.76) 100%), url('/qahwa-hero.jpg')",
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,173,69,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(189,154,255,0.16),transparent_30%)]" />

        <PageContainer className="relative flex min-h-[calc(100svh-4.25rem)] items-center justify-center py-10 sm:py-12 lg:py-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
            className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center"
          >
            <h1 className="max-w-5xl font-display text-[clamp(2rem,4.5vw,4.25rem)] font-extrabold leading-[1.08] tracking-tight text-white text-balance">
              أقوى تحدى معلومات فى كل المواضيع
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-xl">
              لعبة جماعية تلعبها مع اهلك واصحابك على القهوة مكونة من 4 مواضيع يختارها اللاعبين
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <ButtonLink to={primaryRoute} size="lg" className="min-h-14 px-8 text-base sm:text-lg">
                <Swords size={18} aria-hidden="true" />
                {primaryLabel}
              </ButtonLink>
              <a
                href="#how-to-play"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/25 px-7 text-sm font-bold text-white/90 backdrop-blur-sm transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-orange/70 hover:bg-black/35"
              >
                طريقة اللعب
                <ArrowDownLeft size={16} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </PageContainer>
      </section>

      <section id="arena" className="scroll-mt-24 border-b border-border-soft bg-bg-soft/55">
        <PageContainer className="py-14 sm:py-20 lg:py-24">
          <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.5fr)]">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-purple">
                <Clapperboard size={16} aria-hidden="true" />
                اختاروا مجال التحدي
              </p>
              <h2 className="max-w-4xl font-display text-3xl font-bold leading-tight text-ink text-balance sm:text-5xl">
                اسئلة فى كل المواضيع
              </h2>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {EXAMPLE_TOPICS.map((topic, index) => {
              const Icon = getTopicIcon(topic);
              const destination = isAuthenticated ? "/topics" : "/login";
              return (
                <motion.div
                  key={topic}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: reduceMotion ? 0 : 0.32, delay: reduceMotion ? 0 : index * 0.035 }}
                >
                  <Link
                    to={destination}
                    aria-label={`${topic} — ${isAuthenticated ? "افتح بنك المواضيع" : "سجّل الدخول لاختيار المواضيع"}`}
                    className="group relative flex min-h-28 flex-col justify-between overflow-hidden border border-border-soft bg-surface p-4 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-1 hover:border-orange/60 hover:bg-surface-hi focus-visible:outline-offset-4 sm:min-h-36 sm:p-5"
                  >
                    <Icon size={23} className="text-purple transition-colors group-hover:text-orange" aria-hidden="true" />
                    <div className="flex items-end justify-between gap-2">
                      <span className="font-display text-lg font-bold text-ink sm:text-xl">{topic}</span>
                      <ArrowUpLeft size={15} className="text-ink-mute transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-orange" aria-hidden="true" />
                    </div>
                    <span aria-hidden="true" className="absolute -bottom-4 -end-3 h-16 w-16 skew-x-[-18deg] border border-purple/10" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section id="how-to-play" className="scroll-mt-24 border-b border-border-soft">
        <PageContainer className="py-14 sm:py-20 lg:py-24">
          <h2 className="mb-8 font-display text-3xl font-bold leading-tight text-ink text-balance sm:text-5xl">
            طريقة اللعب
          </h2>
          <ol className="divide-y divide-border-soft border-y border-border-soft">
            {HOW_TO_PLAY.map((rule, index) => (
              <motion.li
                key={rule}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-6 sm:py-6"
              >
                <span aria-hidden="true" className="font-display text-2xl font-extrabold text-orange sm:text-3xl">
                  {index + 1}
                </span>
                <p className="pt-1 text-base leading-relaxed text-ink-dim sm:text-lg">{rule}</p>
              </motion.li>
            ))}
          </ol>
        </PageContainer>
      </section>

      <section className="relative overflow-hidden">
        <PageContainer className="py-14 sm:py-20">
          <div className="relative flex flex-col justify-between gap-7 overflow-hidden border border-orange/30 bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:p-10 lg:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute -end-20 -top-32 h-72 w-72 rounded-full border border-orange/20" />
            <div aria-hidden="true" className="pointer-events-none absolute -end-8 -top-20 h-56 w-56 rounded-full border border-orange/15" />
            <div className="relative">
              <h2 className="max-w-4xl font-display text-3xl font-bold leading-tight text-ink text-balance sm:text-5xl">
                دلوقتى مش فاضل غير انك تبدأ تختبر معلوماتك
              </h2>
            </div>
            <ButtonLink to={primaryRoute} size="lg" className="relative min-h-14 shrink-0 px-8">
              العب دلوقتى
              <ArrowUpLeft size={17} aria-hidden="true" />
            </ButtonLink>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
