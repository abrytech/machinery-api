import app from './index.js'
const port = process.env.PORT || 8080

require('greenlock-express')
  .init({
    packageRoot: __dirname,

    // contact for security and critical bug notices
    maintainerEmail: 'abb2007hu@gmail.com',

    // where to look for configuration
    configDir: './greenlock.d',

    // whether or not to run at cloudscale
    cluster: false
  }).ready(httpsWorker(app))
// Serves on 80 and 443
// Get's SSL certificates magically!
// .serve(app)

function httpsWorker (glx) {
  //
  // HTTPS 1.1 is the default
  // (HTTP2 would be the default but... https://github.com/expressjs/express/issues/3388)
  //

  // Get the raw https server:
  console.log(glx)
  var httpsServer = glx.httpsServer(null, function (req, res) {
    res.end('Hello, Encrypted World!')
  })

  httpsServer.listen(port, '0.0.0.0', function () {
    console.info('Listening on ', httpsServer.address())
  })

  // Note:
  // You must ALSO listen on port 80 for ACME HTTP-01 Challenges
  // (the ACME and http->https middleware are loaded by glx.httpServer)
  var httpServer = glx.httpServer()

  httpServer.listen(port, '0.0.0.0', function () {
    console.info('Listening on ', httpServer.address())
  })
}
