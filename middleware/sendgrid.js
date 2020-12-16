import { setApiKey, send } from '@sendgrid/mail'
import template from './email_template'
// async..await is not allowed in global scope, must use a wrapper
export default async function (name, to, key) {
  setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: to,
    from: 'test@example.com', // Use the email address or domain you verified above
    subject: 'Verification',
    text: `Dear ${name} Please Verifiy Account`,
    html: template(key)

  }
  // ES6
  send(msg).then((value) => {
    console.info('Email successfuly sent ', value)
  }, error => {
    console.error(error)
    if (error.response) {
      console.error(error.response.body)
    }
  })
}
// ES8
// (async () => {
//   try {
//     await send(msg)
//   } catch (error) {
//     console.error(error)

//     if (error.response) {
//       console.error(error.response.body)
//     }
//   }
// })()
