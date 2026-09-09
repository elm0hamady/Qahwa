import axios from "axios";
import type { ApiErrorShape } from "@/types/api";

/**
 * Normalizes any error thrown by the API layer into a predictable shape
 * the UI can render without needing to know about axios/DRF internals.
 *
 * Note: this only controls OUR generic fallback messages. If the backend
 * itself returns an `error`/`detail` string, that string is shown as-is —
 * translating those requires Django's own i18n setup (LANGUAGE_CODE=ar +
 * translated strings), which is outside this frontend's control.
 */
export function normalizeError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as
      | Record<string, unknown>
      | undefined;

    if (!error.response) {
      return {
        status: 0,
        message: "تعذّر الوصول إلى السيرفر. تأكد من الاتصال بالإنترنت وحاول تاني.",
        raw: error,
      };
    }

    // DRF validation errors: { field: ["msg"] } or { error: "msg" } or { detail: "msg" }
    let message = "حصل خطأ. حاول تاني.";
    let fieldErrors: Record<string, string[]> | undefined;

    if (data) {
      if (typeof data.error === "string") {
        message = data.error;
      } else if (typeof data.detail === "string") {
        message = data.detail;
      } else {
        const entries = Object.entries(data).filter(([, v]) => Array.isArray(v));
        if (entries.length > 0) {
          fieldErrors = Object.fromEntries(entries) as Record<string, string[]>;
          message = entries.map(([k, v]) => `${k}: ${(v as string[]).join("، ")}`).join(" ");
        }
      }
    }

    if (status === 401) message = message === "حصل خطأ. حاول تاني." ? "انتهت صلاحية الجلسة. سجّل الدخول تاني." : message;
    if (status === 404 && message === "حصل خطأ. حاول تاني.") message = "المحتوى ده مش موجود.";
    if (status >= 500) message = "السيرفر واجه مشكلة. حاول تاني بعد شوية.";

    return { status, message, fieldErrors, raw: error };
  }

  return {
    status: 0,
    message: error instanceof Error ? error.message : "حصل خطأ غير متوقع.",
    raw: error,
  };
}
