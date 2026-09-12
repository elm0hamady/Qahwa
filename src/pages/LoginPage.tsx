import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InlineBanner } from "@/components/common/InlineBanner";
import { Seo } from "@/components/common/Seo";
import { useLogin } from "@/features/auth/hooks";
import { normalizeError } from "@/lib/errors";

const schema = z.object({
  username: z.string().min(1, "دخّل اسم المستخدم بتاع المضيف."),
  password: z.string().min(1, "دخّل الباسورد."),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";
        navigate(redirectTo, { replace: true });
      },
    });
  };

  const apiError = loginMutation.isError ? normalizeError(loginMutation.error) : null;

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-16">
      <Seo
        title="تسجيل دخول المضيف"
        description="سجّل الدخول بحساب المضيف بتاعك في قهوة عشان تشغّل مبارزة أسئلة مباشرة."
        path="/login"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-card border border-border bg-surface/80 p-8 shadow-card backdrop-blur-md"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo className="h-14 w-14" />
          <h1 className="font-display text-2xl font-semibold text-ink">تسجيل دخول المضيف</h1>
          <p className="text-sm text-ink-mute">استخدم حساب المضيف اللي اتعمل لطاولتك في قهوة.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="اسم المستخدم"
            autoComplete="username"
            autoFocus
            error={errors.username?.message}
            {...register("username")}
          />
          <Input
            label="الباسورد"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {apiError && <InlineBanner message={apiError.message} />}

          <Button type="submit" size="md" loading={loginMutation.isPending} className="mt-2 w-full">
            تسجيل الدخول
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-mute">
          لسه معملتش حساب؟{" "}
          <Link to="/register" className="font-bold text-purple hover:underline">
            اعمل حساب مضيف
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
