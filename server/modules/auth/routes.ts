import { Router } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db, rows, decode } from "../../shared/db";
import { verifyPassword, tokenHash } from "../../shared/security";
import { authenticate, route, HttpError } from "../../shared/http";
export const authRouter = Router();
const attempts = new Map<string, { count: number; until: number }>();
authRouter.post(
  "/login",
  route(async (req, res) => {
    const key = req.ip || "local";
    const attempt = attempts.get(key);
    if (attempt && attempt.until > Date.now() && attempt.count >= 10)
      throw new HttpError(429, "Demasiados intentos. Espere 15 minutos.");
    const input = z
      .object({ email: z.email(), password: z.string().min(1).max(128) })
      .parse(req.body);
    const [row] = await rows(
      "SELECT * FROM users WHERE email=? AND status='Activo'",
      [input.email],
    );
    if (!row || !verifyPassword(input.password, row.password_hash)) {
      attempts.set(key, {
        count: (attempt && attempt.until > Date.now() ? attempt.count : 0) + 1,
        until: Date.now() + 900000,
      });
      throw new HttpError(401, "Credenciales inválidas");
    }
    attempts.delete(key);
    const token = randomBytes(32).toString("hex");
    const user = decode(row);
    user.lastAccess = new Date().toISOString();
    await db.execute("UPDATE users SET payload=? WHERE id=?", [
      JSON.stringify(user),
      user.id,
    ]);
    await db.execute(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 8 HOUR))",
      [tokenHash(token), user.id],
    );
    res.json({ token, user });
  }),
);
authRouter.get(
  "/me",
  authenticate,
  route(async (req, res) => res.json(res.locals.user)),
);
authRouter.post(
  "/logout",
  authenticate,
  route(async (req, res) => {
    await db.execute("DELETE FROM sessions WHERE token_hash=?", [
      tokenHash(req.headers.authorization!.slice(7)),
    ]);
    res.sendStatus(204);
  }),
);
