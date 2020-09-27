import nodemailer from 'nodemailer'
import email from './email_template'
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

  const body = email(key)
  console.log(`::::::::::::> Name: ${name} Address To:  ${to} Activation Key: ${key} <::::::::::::::::`)
  console.log(body)
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
