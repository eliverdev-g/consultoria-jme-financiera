import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app";
import type { AddressInfo } from "node:net";
test("CORS permite el frontend configurado y rechaza preflight de otros origenes", async () => {
  const previous = process.env.CORS_ORIGINS;
  process.env.CORS_ORIGINS = "https://jme.example.com";
  const app = createApp();
  if (previous === undefined) delete process.env.CORS_ORIGINS;
  else process.env.CORS_ORIGINS = previous;
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const base = "http://127.0.0.1:" + (server.address() as AddressInfo).port;
  try {
    const preflight = await fetch(base + "/api/clients", {
      method: "OPTIONS",
      headers: {
        Origin: "https://jme.example.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type",
      },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "https://jme.example.com");
    assert.match(preflight.headers.get("access-control-allow-headers") || "", /Authorization/);
    const denied = await fetch(base + "/api/clients", {
      method: "OPTIONS",
      headers: { Origin: "https://unknown.example.com" },
    });
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get("access-control-allow-origin"), null);
    const anonymous = await fetch(base + "/api/clients", {
      headers: { Origin: "https://jme.example.com" },
    });
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.headers.get("access-control-allow-origin"), "https://jme.example.com");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
test("La API rechaza accesos anónimos, tokens falsos y credenciales mal formadas", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const base = "http://127.0.0.1:" + (server.address() as AddressInfo).port;
  try {
    const anonymous = await fetch(base + "/api/clients");
    assert.equal(anonymous.status, 401);
    const forged = await fetch(base + "/api/users", {
      headers: { Authorization: "Bearer jwt-jme-role-administrador" },
    });
    assert.equal(forged.status, 401);
    const login = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "no-es-correo", password: "x" }),
    });
    assert.equal(login.status, 400);
    const malformed = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(malformed.status, 400);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
