import { describe, expect, it } from "vitest";
import axios, { AxiosError } from "axios";
import { normalizeError } from "@/lib/errors";

function makeAxiosError(status: number, data: unknown): AxiosError {
  const error = new axios.AxiosError("Request failed", String(status));
  error.response = {
    status,
    data,
    statusText: "",
    headers: {},
    config: {} as never,
  };
  return error;
}

describe("normalizeError", () => {
  it("surfaces a DRF `detail` message directly", () => {
    const result = normalizeError(makeAxiosError(404, { detail: "Not found." }));
    expect(result.status).toBe(404);
    expect(result.message).toBe("Not found.");
  });

  it("surfaces a DRF `error` message directly", () => {
    const result = normalizeError(makeAxiosError(409, { error: "You already have an active session." }));
    expect(result.message).toBe("You already have an active session.");
  });

  it("collects field validation errors into fieldErrors and a combined message", () => {
    const result = normalizeError(
      makeAxiosError(400, { topic_ids: ["Exactly 4 topics are required."] })
    );
    expect(result.fieldErrors).toEqual({ topic_ids: ["Exactly 4 topics are required."] });
    expect(result.message).toContain("Exactly 4 topics are required.");
  });

  it("gives a friendly message when the server is unreachable", () => {
    const error = new axios.AxiosError("Network Error");
    const result = normalizeError(error);
    expect(result.status).toBe(0);
    expect(result.message).toMatch(/تعذّر الوصول إلى السيرفر/);
  });

  it("gives a generic friendly message for 5xx errors", () => {
    const result = normalizeError(makeAxiosError(500, {}));
    expect(result.message).toMatch(/السيرفر واجه مشكلة/);
  });

  it("falls back gracefully for non-axios errors", () => {
    const result = normalizeError(new Error("boom"));
    expect(result.status).toBe(0);
    expect(result.message).toBe("boom");
  });
});
