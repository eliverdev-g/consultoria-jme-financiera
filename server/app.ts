import express from "express";
import { ZodError } from "zod";
import { authenticate, route, permit, HttpError } from "./shared/http";
import { rows, decode } from "./shared/db";
import { authRouter } from "./modules/auth/routes";
import { clientsRouter } from "./modules/clients/routes";
import { creditsRouter } from "./modules/credits/routes";
import { agreementsRouter } from "./modules/agreements/routes";
import { collectionsRouter } from "./modules/collections/routes";
import { usersRouter } from "./modules/users/routes";
import { paymentsRouter } from "./modules/payments/routes";
import { predictionsRouter } from "./modules/predictions/routes";
import { report } from "./modules/reports/service";
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  const allowedOrigins = new Set(
    (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  app.use("/api", (req, res, next) => {
    const origin = req.get("Origin");
    res.vary("Origin");
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(origin && allowedOrigins.has(origin) ? 204 : 403);
      return;
    }
    next();
  });
  app.use(express.json({ limit: "128kb" }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    next();
  });
  app.get(
    "/api/health",
    route(async (req, res) => {
      await rows("SELECT 1");
      res.json({ status: "ok" });
    }),
  );
  app.use("/api/auth", authRouter);
  app.use("/api", authenticate);
  app.use("/api/clients", clientsRouter);
  app.use("/api/credits", creditsRouter);
  app.use("/api/agreements", agreementsRouter);
  app.use("/api/activities", collectionsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/alerts", predictionsRouter);
  app.get(
    "/api/reports",
    permit("Reportes de cartera vencida"),
    route(async (req, res) => res.json(await report())),
  );
  app.get(
    "/api/bootstrap",
    route(async (req, res) => {
      const u = res.locals.user;
      const can = (m: string) =>
        u.role === "Administrador" ||
        u.permissions.some((p: any) => p.module === m && p.view);
      const list = async (table: string, module: string) =>
        can(module)
          ? (await rows("SELECT payload FROM " + table)).map(decode)
          : [];
      const [clients, agreements, activities, users, alerts] =
        await Promise.all([
          list("clients", "Gestión de clientes"),
          list("agreements", "Convenios de pago"),
          list("activities", "Seguimiento de gestores de cobro"),
          list("users", "Usuarios y permisos"),
          list("alerts", "Dashboard"),
        ]);
      const summary =
        can("Reportes de cartera vencida") || can("Dashboard")
          ? await report()
          : {
              payments: [],
              segments: [],
              totalOverdue: 0,
              clientsInArrears: 0,
              recoveredAmount: 0,
              recoveryRate: 0,
            };
      res.json({ clients, agreements, activities, users, alerts, ...summary });
    }),
  );
  app.use("/api", (req, res) =>
    res.status(404).json({ message: "Servicio no encontrado" }),
  );
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const status =
        err instanceof HttpError
          ? err.status
          : err instanceof ZodError
            ? 400
            : err.code === "ER_DUP_ENTRY"
              ? 409
              : err.type === "entity.parse.failed"
                ? 400
                : 500;
      if (status === 500) console.error(err);
      res.status(status).json({
        message:
          err instanceof ZodError
            ? err.issues
                .map((i) => i.path.join(".") + ": " + i.message)
                .join("; ")
            : status === 409
              ? "El registro ya existe"
              : status === 500
                ? "No se pudo completar la operación. Verifique el servicio y la base de datos."
                : err.message,
      });
    },
  );
  return app;
}
