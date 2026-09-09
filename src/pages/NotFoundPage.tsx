import { Link, useLocation } from "react-router-dom";
import { TokenChip } from "@/components/ui/TokenChip";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Seo } from "@/components/common/Seo";

export function NotFoundPage() {
  const location = useLocation();
  return (
    <PageContainer className="flex flex-col items-center justify-center gap-6 py-28 text-center">
      <Seo title="الصفحة مش موجودة" path={location.pathname} noIndex />
      <div className="flex gap-3">
        <TokenChip value={100} player={1} state="judged" />
        <TokenChip value={300} player={2} state="judged" />
        <TokenChip value={500} player={1} state="judged" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink">السؤال ده مش على اللوحة.</h1>
      <p className="max-w-md text-ink-mute">
        الصفحة اللي بتدور عليها مش موجودة، أو الجولة خلصت بالفعل.
      </p>
      <Link to="/">
        <Button variant="outline">ارجع لـ قهوة</Button>
      </Link>
    </PageContainer>
  );
}
