import nodemailer from 'nodemailer'
// async..await is not allowed in global scope, must use a wrapper
export default async function (name, to, key) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    ignoreTLS: false,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'abb2007hu@gmail.com', // generated ethereal user
      pass: '0922964576' // generated ethereal password
      // user: 'elkadoshenterprise@gmail.com', // generated ethereal user
      // pass: '!@#123Elkadosh' // generated ethereal password
    }
  })

  const body = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
  </head>
  <body>
      <div class="jumbotron">
          <h1 class="display-4">Hello, world!</h1>
          <p class="lead">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
          <hr class="my-4">
          <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>
          <a class="btn btn-primary btn-lg" href="https://machinery-api.herokuapp.com/auth/confirmation/${key}" role="button">Confirm Account</a>
        </div>
  </body>
  </html>`
  console.log(`::::::::::::> Name: ${name} Address To:  ${to} Activation Key: ${key} <::::::::::::::::`)
  // send mail with defined transport object
  transporter.sendMail({
    from: 'abb2007hu@gmail.com', // sender address
    to: to, // list of receivers
    subject: 'Registration Confrimation', // Subject line
    // text:  // plain text body
    html: body // html body
  }).then((info) => {
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    console.log('Message sent: %s', info.messageId)
    // Preview only available when sending through an Ethereal account
    console.log('Message Envelope : %s', info.envelope)
    console.log('Message Accepted : %s', info.accepted)
  }).catch((err) => {
    console.log(err)
  })
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
