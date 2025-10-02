import axios from 'axios'

async function run() {
  const base = process.env.BACKEND_URL || 'http://localhost:4000'
  for (let i = 0; i < 200; i++) {
    const event = {
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString(),
      source_ip: `192.0.2.${Math.floor(Math.random() * 255)}`,
      dest_ip: `198.51.100.${Math.floor(Math.random() * 255)}`,
      domain: ['example.com', 'login.example.com', 'bad.example', 'assets.example.com'][Math.floor(Math.random() * 4)],
      protocol: 'tcp',
      http: { method: 'GET', path: '/', status: [200,200,404,500][Math.floor(Math.random()*4)], user_agent: 'Mozilla/5.0' }
    }
    try { await axios.post(`${base}/api/events`, event) } catch (e) { console.error(e) }
  }
  console.log('seeded')
}
run()
