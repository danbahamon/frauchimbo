import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
}

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '')
  const file = path.join(root, rel)
  if (!file.startsWith(root)) {
    res.writeHead(403)
    res.end()
    return
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('not found')
      return
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' })
    res.end(data)
  })
}).listen(4174, '127.0.0.1', () => {
  console.log('Practice review: http://127.0.0.1:4174/')
})
