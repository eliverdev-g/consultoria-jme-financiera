import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { rows, decode } from "./db";
import { tokenHash } from "./security";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const route =
  (fn: (req: Request, res: Response) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, "") || "";
    if (!/^[a-f0-9]{64}$/.test(token))
      throw new HttpError(401, "Inicie sesión para continuar");
    const [session] = await rows(
      "SELECT u.payload FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>NOW() AND u.status='Activo'",
      [tokenHash(token)],
    );
    if (!session) throw new HttpError(401, "Inicie sesión para continuar");
    res.locals.user = decode(session);
    next();
  } catch (e) {
    next(e);
  }
}
export function permit(module: string, action = "view") {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = res.locals.user;
    if (
      u.role === "Administrador" ||
      u.permissions?.some((p: any) => p.module === module && p[action])
    )
      return next();
    next(new HttpError(403, "No tiene permiso para esta operación"));
  };
}
export async function audit(c: any, user: any, action: string, entity: string) {
  await c.execute(
    "INSERT INTO audit_log(id,user_id,action,entity_id) VALUES(?,?,?,?)",
    [randomUUID(), user.id, action, entity],
  );
}
