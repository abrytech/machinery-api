import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import apiRouter from './router/index'
import { urlencoded, json } from 'body-parser'
import authRouter from './router/auth_router'
import fileUpload from 'express-fileupload'
import { authUser } from './middleware/auth'
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

// import fs from 'fs'
// import path from 'path'
// import https from 'https'

const port = process.env.PORT || 8080
// const host = process.env.HOST || 'http://localhost'
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
  // res.sendFile(`${__dirname}/index.html`)
  res.sendFile('index.html')
})

io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }) // This will emit the event to all connected sockets
io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg)
  })
  socket.broadcast.emit('hi')
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg)
  })
})

app.use('/auth', authRouter)
app.use('/api', authUser, apiRouter)
app.use((req, res, next) => {
  const error = new Error('Resource not found')
  error.status = 404
  next(error)
})

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    name: err.name,
    message: err.message,
    stack: err.stack
  })
})

// if (require.main === module) {
http.listen(port, () => console.log(`listening on:${port}`))
// } else {
// const httpsServer = https.createServer({
//   key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
// }, app)

// httpsServer.listen(port, () => console.log(`a secured server is listening on ${port}`))
// }
