import axios from 'axios'
const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
export async function getOverview() { const r = await axios.get(`${base}/api/overview`); return r.data }
export async function getEvents(q?: string) { const r = await axios.get(`${base}/api/events`, { params: { q } }); return r.data.rows }
export async function postEvent(ev: any) { return axios.post(`${base}/api/events`, ev) }

export function subscribeLive(onEvent: (ev: any) => void) {
  const es = new EventSource(`${base}/api/live`)
  es.onmessage = e => {
    try { const d = JSON.parse(e.data); onEvent(d) } catch (err) { }
  }
  return () => es.close()
}
