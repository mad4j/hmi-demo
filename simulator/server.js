/**
 * simulator/server.js
 *
 * Standalone HTTP server for the device simulator.
 * Exposes a minimal REST + SSE API consumed by the Vue frontend via Vite proxy.
 *
 * Endpoints:
 *   GET  /api/parameters?ids=id1,id2,...   – fetch current parameter values
 *   POST /api/parameters                   – apply { params: { id: value } } updates
 *   GET  /api/notifications                – SSE stream of push notifications
 */

import { createServer } from 'node:http'
import {
  simulateGetParameters,
  simulateSetParameters,
  subscribeToParameterNotifications,
} from './deviceSimulator.js'

const PORT = 3001

// ── SSE client registry ───────────────────────────────────────────────────
const sseClients = new Set()

// Fan-out simulator notifications to all connected SSE clients
subscribeToParameterNotifications((updates) => {
  if (sseClients.size === 0) return
  const payload = `data: ${JSON.stringify(updates)}\n\n`
  sseClients.forEach((res) => res.write(payload))
})

// ── Helper: read full request body ───────────────────────────────────────
const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => resolve(raw))
    req.on('error', reject)
  })

// ── Helper: send JSON response ────────────────────────────────────────────
const sendJson = (res, status, body) => {
  const json = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(json)
}

// ── HTTP server ───────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // GET /api/parameters?ids=id1,id2,...
  if (req.method === 'GET' && url.pathname === '/api/parameters') {
    const idsParam = url.searchParams.get('ids')
    const ids = idsParam ? idsParam.split(',').filter(Boolean) : []
    const result = await simulateGetParameters(ids)
    sendJson(res, 200, result)
    return
  }

  // POST /api/parameters  body: { params: { [id]: value } }
  if (req.method === 'POST' && url.pathname === '/api/parameters') {
    try {
      const body = await readBody(req)
      const { params } = JSON.parse(body)
      if (!params || typeof params !== 'object') {
        sendJson(res, 400, { ok: false, message: 'Missing or invalid "params" field.' })
        return
      }
      const result = await simulateSetParameters(params)
      sendJson(res, 200, result)
    } catch {
      sendJson(res, 400, { ok: false, message: 'Invalid request body.' })
    }
    return
  }

  // GET /api/notifications  (SSE)
  if (req.method === 'GET' && url.pathname === '/api/notifications') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    // Flush headers immediately so the proxy does not buffer
    res.flushHeaders()
    // Keep-alive comment
    res.write(': connected\n\n')

    sseClients.add(res)
    req.on('close', () => sseClients.delete(res))
    return
  }

  sendJson(res, 404, { ok: false, message: 'Not found.' })
})

server.listen(PORT, () => {
  console.log(`[SimulatorServer] Listening on http://localhost:${PORT}`)
})
