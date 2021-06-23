import app from './app'

const port = process.env.PORT || 3030

const start = async () => {
  const srv = await app()
  await srv.listen(port)
  console.log(`Server started at port ${port}`)
}

start()
