
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
      where: { username }
    })
    if (user) {
      if (compareSync(password, user.password)) {
        jwt.sign({ userId: user.id, role: user.role }, ACCESS_TOKEN_SECRET_KEY, (err, token) => {
          if (err) throw err
          res.set({ Authorization: 'Bearer ' + token }).send(user)
        })
      }
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
      if (user.isActivated === false) await User.update({ isActivated: true }, { where: { id: user.id } })
      else {
        error.message = 'Invalid/Expired Activation Link'
        error.name = '406 Not Acceptable'
        error.status = 406
      }
    } else {
      error.message = 'Invalid/Expiered Activation Link'
      error.name = '406 Not Acceptable'
      error.status = 406
    }
  } else {
    error.status = 404
    error.name = '404 Resource Not Found'
    error.message = 'Resource URI is invalid'
  }
  res.status(error.status).json({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  })
})

export default router
