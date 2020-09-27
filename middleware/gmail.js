import nodemailer from 'nodemailer'
import template from './email_template'
// async..await is not allowed in global scope, must use a wrapper
export default async function (to, key) {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    ignoreTLS: false,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'abb2007hu@gmail.com', // generated ethereal user
      pass: '0922964576' // generated ethereal password
    }
  })

  const body = template(key)
  // send mail with defined transport object
  transporter.sendMail({
    from: 'abb2007hu@gmail.com', // sender address
    to: to, // list of receivers
    subject: 'Registration Confrimation', // Subject line
    // text: 'Test email'// plain text body
    html: body // html body
  }).then((info) => {
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    console.log('Message sent: %s', info.messageId)
    console.log('Message Accepted : %s', info.accepted)
  }).catch((err) => {
    console.log(err)
  })
}
