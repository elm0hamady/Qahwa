import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gauge,
  Layers,
  ListChecks,
  ShieldCheck,
  Sparkles,
  SquareStack,
  Swords,
} from "lucide-react";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TokenChip } from "@/components/ui/TokenChip";
import { Seo } from "@/components/common/Seo";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { getTopicIcon } from "@/features/game/topicIcons";

// Just a taste of the variety a question bank can hold — decorative examples,
// not a live list of the app's actual topics (those come from the host's
// real bank once signed in).
const EXAMPLE_TOPICS = ["تاريخ", "أفلام", "رياضة", "علوم", "جغرافيا", "موسيقى", "فن", "طبخ"];

const STEPS = [
  {
    n: "01",
    title: "اختار أربعة مواضيع",
    description:
      "دور في بنك الأسئلة حسب الفئة، واقفل على أربعة مواضيع هيواجهها اللاعبين الاتنين.",
  },
  {
    n: "02",
    title: "شغّل المبارزة",
    description:
      "افتح توكن، اعرض السؤال على الشاشة، وبعدين احكم مين جاوب الأول — كل ده من اللوحة.",
  },
  {
    n: "03",
    title: "احسم النتيجة",
    description:
      "السكور بيتحدث لحظة ما تحكم، ومعاك تعديل يدوي جاهز لو احتجت قاعدة إضافية أو جولة بونص.",
  },
];

const FEATURES = [
  {
    icon: SquareStack,
    title: "بنك أسئلة حقيقي",
    description: "المواضيع متقسمة حسب الفئة والصعوبة — المواضيع الكاملة بس هي اللي توصل للوحة.",
  },
  {
    icon: Swords,
    title: "مصمم للاعبين اتنين",
    description: "كل سيشن مبارزة وجهًا لوجه، واللوحة متقسمة بوضوح بين اللاعبين الاتنين.",
  },
  {
    icon: Gauge,
    title: "سكور مباشر",
    description: "السكور بيتحرك لحظة ما تحكم على سؤال، ومعاك تعديل سريع ±100 لو احتاج الأوضة كده.",
  },
  {
    icon: Layers,
    title: "أسئلة بالصور والصوت",
    description: "صور أو صوت أو فيديو بيظهر جنب نص السؤال لما تفتح التوكن — من غير أي إعداد إضافي.",
  },
  {
    icon: ListChecks,
    title: "سيشن واحدة في المرة",
    description: "المبارزة الشغالة بترجعلك من نفس المكان، فالـ refresh مايضيعش حالة اللوحة.",
  },
  {
    icon: ShieldCheck,
    title: "حسابات مضيف مؤمّنة بـ JWT",
    description: "كل حركة على اللوحة مربوطة بجلسة المضيف بتاعك، والتوكنز بتتجدد أوتوماتيك.",
  },
];

export function LandingPage() {
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
      description:
        "تطبيق مبارزات أسئلة يديره المضيف. اختر أربعة مواضيع، شغّل لوحة مباشرة بين لاعبين، واحسم النتيجة لحظة بلحظة.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ];

  return (
    <>
      <Seo
        title="قهوة — مبارزات أسئلة يديرها المضيف"
        description="قهوة بتحوّل بنك الأسئلة بتاعك لمبارزة مباشرة بين لاعبين. اختار أربعة مواضيع، افتح اللوحة، واحكم كل جولة من شاشة واحدة."
        path="/"
        jsonLd={jsonLd}
      />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <PageContainer className="grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple/30 bg-purple/10 px-3 py-1 text-xs font-medium text-purple">
              <Sparkles size={12} />
              مبارزات أسئلة يديرها المضيف
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-ink text-balance sm:text-5xl lg:text-6xl">
              شغّل ليلة أسئلة الناس هتفضل تتكلم عنها.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-dim">
              قهوة بتحوّل بنك الأسئلة بتاعك لمبارزة مباشرة بين لاعبين. اختار المواضيع،
              افتح اللوحة، واحكم كل جولة من شاشة واحدة — والسكور بيتحدث معاك أول بأول.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login">
                <Button variant="purple" size="lg">
                  ابدأ الاستضافة
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  شوف طريقة اللعب
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <HeroVisual />
          </motion.div>
        </PageContainer>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-border-soft">
        <PageContainer className="py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-ink text-balance">
              ثلاث خطوات من لوحة فاضية للنتيجة النهائية.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full p-6">
                  <span className="font-display text-2xl font-semibold text-purple">{step.n}</span>
                  <h3 className="mt-3 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mute">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            <TokenChip value={100} player={1} state="locked" size="sm" />
            <TokenChip value={300} player={2} state="opened" size="sm" />
            <TokenChip value={500} player={1} state="judged" size="sm" />
            <p className="ms-2 text-sm text-ink-mute">
              مقفول، متفتح، متجادج — كل توكن على اللوحة بيقولك بالظبط الجولة واصلة فين.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* EXAMPLE TOPICS — decorative preview, not a live/complete list */}
      <section className="border-t border-border-soft bg-bg-soft/40">
        <PageContainer className="py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-ink text-balance">
              أي موضوع تقريبًا يقدر يتحول للعبة.
            </h2>
            <p className="mt-2 text-ink-mute">مجرد أمثلة — بنك الأسئلة بتاعك هو اللي بيحدد المواضيع الفعلية.</p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {EXAMPLE_TOPICS.map((topic, i) => {
              const Icon = getTopicIcon(topic);
              return (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, y: 16, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.05 }}
                  whileHover={{ scale: 1.06, y: -4 }}
                >
                  <Card className="flex flex-col items-center gap-2 p-5 text-center transition-colors hover:border-purple">
                    <span className="flex h-12 w-12 items-center justify-center rounded-token border-2 border-purple bg-purple-dim text-purple">
                      {/* oxlint-disable-next-line react-hooks/static-components */}
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-bold text-ink">{topic}</span>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* FEATURES */}
      <section className="border-t border-border-soft">
        <PageContainer className="py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-ink text-balance">
              كل حاجة محتاجها الجولة المباشرة، ولا حاجة زيادة عن اللزوم.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full p-6 transition-colors hover:border-purple/40">
                  <span className="flex h-10 w-10 items-center justify-center rounded-token border border-border text-purple">
                    <feature.icon size={18} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mute">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* CTA */}
      <section className="border-t border-border-soft">
        <PageContainer className="py-20">
          <Card className="relative mx-auto max-w-4xl overflow-hidden px-8 py-14 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 500px 260px at 50% 0%, rgba(139,92,246,0.14), transparent 60%)",
              }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold text-ink text-balance sm:text-4xl">
                لوحتك بعيدة عنك بتسجيل دخول واحد بس.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-ink-mute">
                سجّل الدخول بحساب المضيف بتاعك وجهّز الطاولة لمبارزة الليلة دي.
              </p>
              <Link to="/login" className="mt-7 inline-block">
                <Button variant="purple" size="lg">
                  ابدأ الاستضافة
                </Button>
              </Link>
            </div>
          </Card>
        </PageContainer>
      </section>
    </>
  );
}
