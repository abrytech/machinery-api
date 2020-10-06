import app from './index'
import fs from 'fs'
import path from 'path'
import https from 'https'
const port = process.env.PORT || 8080

const httpsServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app)

httpsServer.listen(port, () => console.log(`a secured server is listening on ${port}`))
