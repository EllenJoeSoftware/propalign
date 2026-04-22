import { NextResponse } from 'next/server';
import * as mariadb from 'mariadb';

export async function GET() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    return NextResponse.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
  }

  // Redact password for logging
  const redacted = rawUrl.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL (redacted):', redacted);

  let conn: mariadb.Connection | null = null;
  try {
    const normalizedUrl = rawUrl.replace(/^mysql:\/\//, 'mariadb://');
    conn = await mariadb.createConnection({ uri: normalizedUrl, connectTimeout: 8000 });
    const rows = await conn.query('SELECT 1 AS ok');
    return NextResponse.json({ status: 'connected', url: redacted, result: rows });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      code: err.code,
      errno: err.errno,
      url: redacted,
    }, { status: 500 });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}
