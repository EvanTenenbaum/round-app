import { buildApp } from './app'

const PORT = parseInt(process.env.PORT || '4000', 10)
const HOST = process.env.HOST || '0.0.0.0'

async function start() {
  const app = await buildApp()

  try {
    await app.listen({ port: PORT, host: HOST })
    console.log(`🔥 Round API running at http://${HOST}:${PORT}`)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📖 API docs at http://${HOST}:${PORT}/docs`)
    }
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
