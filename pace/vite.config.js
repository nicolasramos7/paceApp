import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const demoParticipantsPath = path.join(__dirname, '.demo/demoParticipants.json')

async function readDemoParticipants() {
  try {
    return JSON.parse(await fs.readFile(demoParticipantsPath, 'utf8'))
  } catch {
    return []
  }
}

async function writeDemoParticipants(users) {
  await fs.mkdir(path.dirname(demoParticipantsPath), { recursive: true })
  await fs.writeFile(demoParticipantsPath, `${JSON.stringify(users, null, 2)}\n`)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function demoParticipantsPlugin() {
  return {
    name: 'demo-participants-api',
    configureServer(server) {
      server.middlewares.use('/api/demo-participants', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'GET') {
          res.end(JSON.stringify(await readDemoParticipants()))
          return
        }

        if (req.method === 'POST') {
          const participant = JSON.parse(await readBody(req))
          const users = await readDemoParticipants()
          const nextUsers = [
            participant,
            ...users.filter((user) => user.id !== participant.id),
          ]
          await writeDemoParticipants(nextUsers)
          res.end(JSON.stringify(nextUsers))
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), demoParticipantsPlugin()],
})
