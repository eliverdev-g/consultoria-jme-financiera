import "dotenv/config";
import mysql, { PoolConnection, RowDataPacket } from "mysql2/promise";
export const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "jme",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "jme",
  connectionLimit: 10,
  charset: "utf8mb4",
  decimalNumbers: true,
});
export async function rows(
  sql: string,
  args: any[] = [],
  connection: any = db,
): Promise<any[]> {
  const [result] = await connection.execute(sql, args);
  return result as RowDataPacket[];
}
export const decode = (row: any) =>
  typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
export async function transaction<T>(
  fn: (c: PoolConnection) => Promise<T>,
): Promise<T> {
  const c = await db.getConnection();
  await c.beginTransaction();
  try {
    const result = await fn(c);
    await c.commit();
    return result;
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}
