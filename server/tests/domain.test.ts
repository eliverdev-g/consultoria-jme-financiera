import { test } from "node:test";
import assert from "node:assert/strict";
import { schedule } from "../modules/agreements/service";
import { assess } from "../modules/predictions/service";
import { hashPassword, verifyPassword, tokenHash } from "../shared/security";
import { permit, HttpError } from "../shared/http";
test("Las cuotas conservan todos los centavos", () => {
  const result = schedule(100, 3, "Mensual", "2026-01-31");
  assert.deepEqual(
    result.map((i) => Math.round(i.amount * 100)),
    [3333, 3333, 3334],
  );
  assert.deepEqual(
    result.map((i) => i.dueDate),
    ["2026-01-31", "2026-02-28", "2026-03-31"],
  );
});
test("Las fechas quincenales y semanales parten de la fecha elegida", () => {
  assert.deepEqual(
    schedule(100, 3, "Quincenal", "15/12/2026").map((i) => i.dueDate),
    ["2026-12-15", "2026-12-30", "2027-01-14"],
  );
  assert.equal(
    schedule(100, 2, "Semanal", "2026-12-28")[1].dueDate,
    "2027-01-04",
  );
});
test("El calendario mensual respeta años bisiestos", () =>
  assert.equal(
    schedule(100, 2, "Mensual", "2028-01-31")[1].dueDate,
    "2028-02-29",
  ));
test("Las fechas inexistentes se rechazan", () =>
  assert.throws(() => schedule(100, 2, "Mensual", "2026-02-31")));
test("El puntaje es determinista, acotado y aumenta con la mora", () => {
  assert.deepEqual(assess(45, 1000), assess(45, 1000));
  assert.ok(assess(90, 1000).riskScore > assess(30, 1000).riskScore);
  assert.equal(assess(10000, 1e6).riskScore, 98);
});
test("Las contraseñas se verifican y usan sal aleatoria", () => {
  const a = hashPassword("UnaClaveSegura123!");
  const b = hashPassword("UnaClaveSegura123!");
  assert.notEqual(a, b);
  assert.ok(verifyPassword("UnaClaveSegura123!", a));
  assert.equal(verifyPassword("incorrecta", a), false);
  assert.equal(tokenHash("token").length, 64);
});
test("Los permisos deniegan operaciones no concedidas", () => {
  let error: any;
  permit("Usuarios y permisos", "edit")(
    {} as any,
    { locals: { user: { role: "Consulta", permissions: [] } } } as any,
    (e?: any) => {
      error = e;
    },
  );
  assert.ok(error instanceof HttpError);
  assert.equal(error.status, 403);
  let allowed = false;
  permit("Usuarios y permisos", "edit")(
    {} as any,
    { locals: { user: { role: "Administrador" } } } as any,
    () => {
      allowed = true;
    },
  );
  assert.ok(allowed);
});
