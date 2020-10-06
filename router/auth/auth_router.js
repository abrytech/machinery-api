
import { Router } from 'express'
import { User, Address, Picture } from '../../sequelize/db/models'
import { compareSync } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { validate } from 'uuid'
const { ACCESS_TOKEN_SECRET_KEY } = process.env
const router = Router()

router.post('/login', async (req, res) => {
  let user = {}
  const { username, password } = req.body
  if (username && password) {
    user = await User.findOne({
      include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
      where: { username, isActivated: true }
    }).catch((error) => res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } }))
    if (user) {
      if (compareSync(password, user.password)) {
        jwt.sign({ userId: user.id, role: user.role }, ACCESS_TOKEN_SECRET_KEY, (error, token) => {
          if (error) res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
          res.set({ Authorization: 'Bearer ' + token, 'Access-control-expose-headers': 'Authorization' }).send(user)
        })
      } else {
        res.status(401).send({ error: { name: 'Authentication Failed', message: 'Invalid Username or Password', stack: '' } })
      }
    } else {
      res.status(401).send({ error: { name: 'Authentication Failed', message: 'Invalid Username or Password', stack: '' } })
    }
  }
})

router.get('/confirmation/:key', async (req, res) => {
  const activationKey = req.params.key
  const error = new Error()
  const isValid = validate(activationKey)
  if (activationKey && isValid) {
    const user = await User.findOne({ where: { activationKey } })
    if (user) {
      if (user.isActivated === false) {
        await User.update({ isActivated: true }, { where: { id: user.id } })
        res.redirect('http://localhost:3000/login/confirmed')
      } else {
        error.message = 'Invalid/Expired Activation Link'
        error.status = 406
      }
    } else {
      error.message = 'Invalid/Expiered Activation Link'
      error.status = 406
    }
  } else {
    error.status = 404
    error.message = 'Resource URI is invalid'
  }
  res.status(error.status).json({
    error: {
      message: error.message,
      stack: error.stack
    }
  })
})

export default router
