import nodemailer from 'nodemailer'
// async..await is not allowed in global scope, must use a wrapper
export default async function (name, to, key) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail', // true for 465, false for other ports
    auth: {
      user: 'abb2007hu@gmail.com', // generated ethereal user
      pass: '0922964576' // generated ethereal password
      // user: 'elkadoshenterprise@gmail.com', // generated ethereal user
      // pass: '!@#123Elkadosh' // generated ethereal password
    }
  })
  console.log(`@@@@@@@@@@@@@@@@#################>>>Name ${name} To  ${to} Activation Key${key} <<<#################@@@@@@@@@@@@@@@@`)
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'abb2007hu@gmail.com', // sender address
    to: 'eliasnegasa5@gmail.com', // list of receivers
    subject: 'Registration Confrimation', // Subject line
    text: `https://machinery-api.herokuapp.com/auth/confirmation/${key}` // plain text body
    // html: body // html body
  })

  console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
