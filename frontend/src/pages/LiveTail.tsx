import React, { useEffect, useState } from 'react'
import { subscribeLive, postEvent } from '../api'

export default function LiveTail(){
  const [events, setEvents] = useState<any[]>([])
  useEffect(()=>{
    const unsub = subscribeLive((ev)=>{
      if (ev.heartbeat) return
      setEvents(prev=>[ev,...prev].slice(0,100))
    })
    return unsub
  }, [])

  const generate = async () => {
    await postEvent({ domain: `gen${Math.floor(Math.random()*100)}.test`, source_ip: `192.0.2.${Math.floor(Math.random()*255)}`, timestamp: new Date().toISOString(), http: { method: 'GET', path:'/' } })
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-2"><h2 className="text-lg font-semibold">Live Tail</h2><button onClick={generate} className="px-3 py-1 bg-blue-600 text-white rounded">Generate Synthetic Traffic</button></div>
      <div className="bg-white rounded p-2 max-h-96 overflow-auto">
        {events.map((e, i)=>(<div key={i} className="p-2 border-b">{new Date(e.timestamp).toLocaleString()} — <strong>{e.domain}</strong> — {e.source_ip}</div>))}
      </div>
    </section>
  )
}
