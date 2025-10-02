import Database from 'better-sqlite3'
import path from 'path'

const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'events.db')
const db = new Database(dbFile)

db.exec(`
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  source_ip TEXT,
  source_port INTEGER,
  dest_ip TEXT,
  dest_port INTEGER,
  protocol TEXT,
  domain TEXT,
  http_method TEXT,
  http_path TEXT,
  http_status INTEGER,
  user_agent TEXT,
  raw_json TEXT
);
`)

export function insertEvent(event: any) {
  const stmt = db.prepare(`INSERT INTO events (timestamp, source_ip, source_port, dest_ip, dest_port, protocol, domain, http_method, http_path, http_status, user_agent, raw_json)
    VALUES (@timestamp, @source_ip, @source_port, @dest_ip, @dest_port, @protocol, @domain, @http_method, @http_path, @http_status, @user_agent, @raw_json)`)
  const info = stmt.run({
    timestamp: event.timestamp,
    source_ip: event.source_ip,
    source_port: event.source_port,
    dest_ip: event.dest_ip,
    dest_port: event.dest_port,
    protocol: event.protocol,
    domain: event.domain,
    http_method: event.http?.method || null,
    http_path: event.http?.path || null,
    http_status: event.http?.status || null,
    user_agent: event.http?.user_agent || null,
    raw_json: JSON.stringify(event)
  })
  return info.lastInsertRowid
}

export function queryEvents({ q = '', limit = 50, from, to }: any) {
  let sql = 'SELECT * FROM events'
  const conditions: string[] = []
  const params: any = {}
  if (q) { conditions.push('(domain LIKE @q OR source_ip LIKE @q OR dest_ip LIKE @q)'); params.q = `%${q}%` }
  if (from) { conditions.push('timestamp >= @from'); params.from = from }
  if (to) { conditions.push('timestamp <= @to'); params.to = to }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ')
  sql += ' ORDER BY timestamp DESC LIMIT @limit'
  params.limit = Number(limit || 50)
  const stmt = db.prepare(sql)
  return stmt.all(params)
}

export function getOverview() {
  const total = db.prepare('SELECT COUNT(*) as cnt FROM events').get().cnt
  const topDomains = db.prepare('SELECT domain, COUNT(*) as cnt FROM events GROUP BY domain ORDER BY cnt DESC LIMIT 10').all()
  const recent = db.prepare('SELECT timestamp, domain, source_ip FROM events ORDER BY timestamp DESC LIMIT 10').all()
  return { total, topDomains, recent }
}
