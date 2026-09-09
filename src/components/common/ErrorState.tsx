import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 border-danger/30 px-8 py-14 text-center">
      <AlertTriangle className="text-danger" size={28} />
      <h3 className="text-lg font-semibold text-ink">حصلت مشكلة</h3>
      <p className="max-w-sm text-sm text-ink-mute">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          حاول تاني
        </Button>
      )}
    </Card>
  );
}
