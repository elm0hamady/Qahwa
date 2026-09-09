import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InlineBanner } from "@/components/common/InlineBanner";
import { Seo } from "@/components/common/Seo";
import { useRegister } from "@/features/auth/hooks";
import { normalizeError } from "@/lib/errors";

const schema = z
  .object({
    first_name: z.string().min(1, "دخّل الاسم الأول."),
    last_name: z.string().min(1, "دخّل اسم العائلة."),
    username: z.string().min(1, "دخّل اسم مستخدم."),
    email: z.string().min(1, "دخّل الإيميل.").email("الإيميل ده مش شكله صح."),
    password: z.string().min(8, "الباسورد لازم يكون 8 حروف على الأقل."),
    password_confirm: z.string().min(1, "أكّد الباسورد."),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "الباسورد وتأكيده مش متطابقين.",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const registerMutation = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    registerMutation.mutate(values);
  };

  const apiError = registerMutation.isError ? normalizeError(registerMutation.error) : null;

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-16">
      <Seo
        title="إنشاء حساب مضيف"
        description="اعمل حساب مضيف جديد في قهوة وابدأ تستضيف مبارزات أسئلة."
        path="/register"
        noIndex
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/10 blur-[100px]" />
      </div>

      {registerMutation.isSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="relative w-full max-w-sm"
        >
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-token border-2 border-purple bg-purple-dim text-purple">
              <MailCheck size={26} />
            </span>
            <h1 className="font-display text-xl font-bold text-ink">راجع إيميلك</h1>
            <p className="text-sm text-ink-mute">
              بعتنالك رابط تفعيل على إيميلك. دوس عليه عشان تفعّل حسابك، وبعدها تقدر تسجّل دخول عادي.
            </p>
            <Link to="/login" className="mt-2">
              <Button variant="outline">روح لتسجيل الدخول</Button>
            </Link>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-card border-2 border-border bg-surface p-8 shadow-card"
        >
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-token border-2 border-purple text-purple">
              <Coffee size={20} />
            </span>
            <h1 className="font-display text-2xl font-bold text-ink">اعمل حساب مضيف</h1>
            <p className="text-sm text-ink-mute">هتقدر تستضيف مبارزات أسئلة بعد ما تفعّل إيميلك.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="الاسم الأول"
                autoComplete="given-name"
                autoFocus
                error={errors.first_name?.message}
                {...registerField("first_name")}
              />
              <Input
                label="اسم العائلة"
                autoComplete="family-name"
                error={errors.last_name?.message}
                {...registerField("last_name")}
              />
            </div>
            <Input
              label="اسم المستخدم"
              autoComplete="username"
              error={errors.username?.message}
              {...registerField("username")}
            />
            <Input
              label="الإيميل"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...registerField("email")}
            />
            <Input
              label="الباسورد"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...registerField("password")}
            />
            <Input
              label="تأكيد الباسورد"
              type="password"
              autoComplete="new-password"
              error={errors.password_confirm?.message}
              {...registerField("password_confirm")}
            />

            {apiError && <InlineBanner message={apiError.message} />}

            <Button type="submit" size="md" loading={registerMutation.isPending} className="mt-2 w-full">
              إنشاء الحساب
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-mute">
            عندك حساب بالفعل؟{" "}
            <Link to="/login" className="font-bold text-purple hover:underline">
              سجّل دخول
            </Link>
          </p>
        </motion.div>
      )}
    </div>
  );
}
