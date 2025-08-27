const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initSocket } = require('./src/lib/socket')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  initSocket(server)

  server.listen(port, (err) => {
    if (err) throw err
  })
}) 