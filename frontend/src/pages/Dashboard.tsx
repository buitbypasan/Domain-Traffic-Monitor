import React, { useEffect, useState } from 'react'
import { getOverview } from '../api'

export default function Dashboard(){
  const [overview, setOverview] = useState<any>(null)
  useEffect(()=>{ getOverview().then(setOverview) }, [])
  if(!overview) return <div>Loading...</div>
  return (
    <section className="mb-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded">Total events<div className="text-2xl font-bold">{overview.total}</div></div>
        <div className="p-4 bg-white rounded">Top domain<div>{overview.topDomains.map((d:any)=> <div key={d.domain}>{d.domain} ({d.cnt})</div>)}</div></div>
        <div className="p-4 bg-white rounded">Recent<div>{overview.recent.map((r:any)=><div key={r.timestamp}>{r.timestamp} — {r.domain}</div>)}</div></div>
      </div>
    </section>
  )
}
