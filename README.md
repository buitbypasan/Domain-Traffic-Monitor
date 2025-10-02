# Domain Traffic Monitor — Project Blueprint & Starter Code

> Single-file starter blueprint and React + Node scaffold for a web app that monitors domain traffic, analyzes it, and presents a rich UI.

---

## 1. Overview

A scalable web application that ingests domain/network traffic and security-relevant signals, stores and processes them for real-time and historical analysis, and exposes a responsive UI for visualization, alerts, and investigative workflows.

Goals:
- Real-time domain traffic monitoring (HTTP/DNS/NetFlow/basic packet metadata)
- Rich analytics UI (dashboards, top-talkers, trends, per-domain drilldowns)
- Alerting (suspicious domains, spikes, anomalies)
- Historical search and forensic tools (flows, sessions)
- Extensible: add new collectors and machine learning models later

---

## 2. High-level architecture

1. **Collectors / Agents**
   - Lightweight metric/log shippers running on network taps or gateways.
   - Collect: HTTP access logs, DNS logs, NetFlow/IPFIX, and optional packet metadata (not full pcap unless required).
   - Options: Filebeat/Vector for logs, custom Go agent for NetFlow, Suricata for IDS + eve.json.

2. **Ingest & Messaging**
   - Kafka (or RabbitMQ) for high-throughput streaming ingestion.
   - Ingest transformer services normalize records to a canonical event schema.

3. **Stream Processing**
   - ksqlDB / Flink / Kafka Streams for aggregations, enrichment (GeoIP, ASN, WHOIS, threat intel), and anomaly detection.

4. **Storage**
   - Time-series & logs: ClickHouse or Elasticsearch for fast analytics and search.
   - Long-term events / object store: S3-compatible storage for raw events and archives.
   - Meta and user data: PostgreSQL for app config, users, and alerts.

5. **Backend API**
   - Node.js + TypeScript (Express/Fastify) or Go for high performance.
   - Exposes REST + GraphQL endpoints for dashboards and exploration.
   - Authentication: JWT + role-based access.

6. **Frontend**
   - React + TypeScript + Vite
   - UI library: TailwindCSS + headless components (Radix or shadcn)
   - Charts: Recharts or Apache ECharts (or Chart.js) for visualizations

7. **Alerting / Notifier**
   - Alert manager (Prometheus Alertmanager, or custom) with webhooks, email, Slack

8. **Orchestration & Deployment**
   - Docker Compose for quick dev; Kubernetes for production
   - CI/CD: GitHub Actions or GitLab CI

---

## 3. Canonical event schema (JSON)

```json
{
  "timestamp": "2025-10-02T12:34:56Z",
  "source_ip": "203.0.113.5",
  "source_port": 54321,
  "dest_ip": "198.51.100.22",
  "dest_port": 80,
  "protocol": "tcp",
  "domain": "example.com",
  "http": {
    "method": "GET",
    "path": "/index.html",
    "status": 200,
    "user_agent": "Mozilla/5.0",
    "referer": "https://google.com"
  },
  "dns": {
    "query": "example.com",
    "type": "A",
    "rcode": "NOERROR",
    "answers": ["198.51.100.22"]
  },
  "geo": {"src_country":"AU","dst_country":"US"},
  "asn": {"src_asn":12345},
  "threat": {"intel_matches": ["malicious-example.com"]},
  "raw": {"collector":"filebeat","raw_event_id":"..."}
}
```

---

## 4. Key features & UI screens

- **Overview Dashboard**: traffic volume (req/min), top domains, biggest responders, latency histograms, recent alerts.
- **Domain Explorer**: search by domain, show timeline of queries, top source IPs, geo map, WHOIS and ASN.
- **Live Tail**: live streaming view of incoming events with filters.
- **Alerts**: alert list, rule editor, alert details, acknowledge/resolve controls.
- **Investigate**: session view, follow-the-packet, quick pcap download (if stored).
- **Settings**: collectors, enrichment sources (GeoIP, WHOIS, threat lists), users/roles.

UX notes:
- Use incremental loading and server-side pagination for huge result sets.
- Provide permutations of time-range quick filters and custom ranges.

---

## 5. Data enrichment & third-party integrations

- **GeoIP** (MaxMind or local DB)
- **ASN lookup** (Team Cymru)
- **WHOIS** (throttled caching layer)
- **Threat intel** (MISP, AlienVault, or public blocklists)
- **TLS fingerprinting** (JA3) and HTTP fingerprinting (Wappalyzer-like)

---

## 6. Security & privacy considerations

- Avoid storing full packet captures unless necessary; strip payloads when storing logs to protect privacy.
- Role-based access: operators vs auditors vs admins.
- Rate-limit WHOIS and external lookups; cache results.
- Encrypt sensitive data at rest (S3, DBs) and in transit (TLS everywhere).

---

## 7. Minimal viable stack recommendation (MVP)

- Collectors: Filebeat for HTTP logs + vector for transforms
- Messaging: Kafka (single broker in dev)
- Stream processing: ksqlDB for windowed counts + enrichments
- Storage: ClickHouse for analytics
- Backend: Node.js + Fastify + TypeScript
- Frontend: React + Vite + Tailwind
- Deployment: Docker Compose

This stack gives low-latency analytics and straightforward development.

---

## 8. Starter repo scaffold (files + brief snippets)

```
domain-monitor/
├─ backend/
│  ├─ src/
│  │  ├─ server.ts         # Fastify entry
│  │  ├─ routes/
│  │  │  └─ events.ts
│  │  ├─ services/
│  │  └─ db/
│  ├─ Dockerfile
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ pages/
│  │  │  ├─ Dashboard.tsx
│  │  │  └─ DomainExplorer.tsx
│  │  └─ components/
│  ├─ index.html
│  └─ package.json
├─ infra/
│  ├─ docker-compose.yml
│  └─ k8s/ (optional)
└─ README.md
```

### Backend sample (TypeScript - Fastify route)

```ts
// backend/src/routes/events.ts
import { FastifyInstance } from 'fastify'
export default async function (fastify: FastifyInstance) {
  fastify.get('/api/events', async (req, reply) => {
    const { q, limit = 50, from, to } = req.query as any
    // query ClickHouse or Elasticsearch - simplified
    const rows = await fastify.db.query('SELECT * FROM events WHERE domain LIKE ? LIMIT ?', [`%${q || ''}%`, Number(limit)])
    return { ok: true, rows }
  })
}
```

### Frontend sample (React Dashboard card)

```tsx
// frontend/src/components/TrafficCard.tsx
import React from 'react'
export default function TrafficCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 rounded-xl shadow-sm bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
```

---

## 9. API endpoints (suggested)

- `GET /api/overview` — summary metrics
- `GET /api/events` — search events (filters: domain, ip, src/dst, time range)
- `GET /api/domains/:name` — domain details & top sources
- `GET /api/live` — SSE or WebSocket stream of recent events
- `POST /api/alerts` — create alert rule
- `GET /api/alerts` — list alerts

All protected by JWT + RBAC.

---

## 10. Alerting rules examples

- **Volume spike:** domain requests > 5x baseline in 5 minutes
- **Suspicious TLD:** connections to newly-registered TLDs or rare TLDs
- **Threat match:** domain matched threat intel list
- **Data exfil:** many unique destinations with small payload sizes (requires metadata)

---

## 11. Deployment - quick Docker Compose example

```yaml
version: '3.7'
services:
  zookeeper: { image: 'confluentinc/cp-zookeeper:latest' }
  kafka: { image: 'confluentinc/cp-kafka:latest', depends_on: ['zookeeper'] }
  clickhouse: { image: 'clickhouse/clickhouse-server:latest' }
  backend: { build: ./backend, ports: ['4000:4000'], depends_on: ['kafka','clickhouse'] }
  frontend: { build: ./frontend, ports: ['3000:3000'] }
```

---

## 12. Next steps (practical milestones)

1. **Prototype ingest**: ship a small set of synthetic logs to Kafka and store in ClickHouse.
2. **Backend API**: implement `GET /api/events` and `GET /api/overview`.
3. **Frontend Dashboard**: show basic traffic metrics and top domains.
4. **Add enrichment**: GeoIP + ASN lookups.
5. **Alerts**: implement a simple alert rule engine with webhooks.
6. **Scale & harden**: containerize, add auth, rate-limits, and monitoring.

---

## 13. Helpful tips

- For prototyping, keep things simple: avoid full Kafka unless expected throughput requires it — you can start with Redis Streams or even direct HTTP ingestion.
- ClickHouse is extremely fast for analytic queries but has design patterns to learn (merge tree, partitions). Elasticsearch is easier for text search.
- Use sample datasets (public HTTP logs, DNS logs) for UI development.

---

## 14. Want me to generate code?

I included small code snippets and a scaffold above. If you want I can:
- Generate the full starter repo (frontend + backend + docker-compose) and provide it as downloadable files
- Or implement any one of these milestones fully (e.g., working `GET /api/events` + frontend dashboard)

Tell me which one you'd like and I'll scaffold it out.

---

*End of blueprint.*
