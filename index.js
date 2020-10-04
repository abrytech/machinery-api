import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import apiRouter from './router/index'
import { urlencoded, json } from 'body-parser'
import authRouter from './router/auth/auth_router'
import fileUpload from 'express-fileupload'
const app = express()
const port = process.env.PORT || 8080
const host = process.env.HOST || 'http://localhost'
const www = process.env.WWW || './public'
app.use(compression())
app.use(helmet())
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}))
app.use(urlencoded({ extended: false }))
app.use(json())
app.use(express.static(www))
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }
}))
app.get('/', function (req, res) {
  res.sendFile('index.html')
})
app.use('/auth', authRouter)
app.use('/api', apiRouter)
app.use((req, res, next) => {
  const error = new Error('Resource not found')
  error.status = 404
  next(error)
})
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  })
})
app.listen(port, () => console.log(`listening on ${host}:${port}`))

export default app
