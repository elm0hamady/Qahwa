import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/features/auth/store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("starts unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });

  it("marks the session authenticated once tokens are set", () => {
    useAuthStore.getState().setTokens({ access: "access-token", refresh: "refresh-token" });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe("access-token");
    expect(state.refreshToken).toBe("refresh-token");
  });

  it("replaces only the access token on refresh, keeping the refresh token", () => {
    useAuthStore.getState().setTokens({ access: "old-access", refresh: "refresh-token" });
    useAuthStore.getState().setAccessToken("new-access");
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("new-access");
    expect(state.refreshToken).toBe("refresh-token");
  });

  it("clears everything on logout", () => {
    useAuthStore.getState().setTokens({ access: "a", refresh: "r" });
    useAuthStore.getState().setUsername("mohamed");
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.username).toBeNull();
  });
});
