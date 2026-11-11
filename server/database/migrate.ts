import { readFile } from "node:fs/promises";
import { db } from "../shared/db";
try {
  const sql = await readFile(
    new URL("../../database/001-schema.sql", import.meta.url),
    "utf8",
  );
  for (const statement of sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await db.query(statement);
  console.log("Esquema MariaDB creado.");
} finally {
  await db.end();
}
