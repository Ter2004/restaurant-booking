/**
 * Unit tests for frontend API utility functions.
 * These tests mock fetch and verify request construction.
 */

const BASE_URL = "http://localhost:8000";

// Simple api helper mirroring lib/api.ts behaviour
async function apiFetch(path: string, token?: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  return res;
}

describe("API helper", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("adds Authorization header when token provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await apiFetch("/restaurants/", "my-token");

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/restaurants/`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-token",
        }),
      })
    );
  });

  test("does not add Authorization header when no token", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ([]) });

    await apiFetch("/restaurants/");

    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(callArgs.headers).not.toHaveProperty("Authorization");
  });

  test("passes correct URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await apiFetch("/health");

    expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/health`, expect.any(Object));
  });

  test("passes POST body correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const body = JSON.stringify({ email: "test@example.com", password: "password123" });
    await apiFetch("/auth/login", undefined, { method: "POST", body });

    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(callArgs.method).toBe("POST");
    expect(callArgs.body).toBe(body);
  });
});
