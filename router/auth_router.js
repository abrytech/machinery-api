
import { Router } from 'express'
import { User, Address, Picture } from '../sequelize/models'
import { compareSync } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { validate } from 'uuid'
import { authUser, removeFields } from '../middleware/auth'
import sendConfirmation from '../middleware/gmail'
import { uploadFileIntoS3 } from '../middleware/aws'
const { ACCESS_TOKEN_SECRET_KEY } = process.env
const router = Router()

router.get('/me', authUser, async (req, res) => {
  const where = { id: req.userId, isApproved: true, isActivated: true, spam: false, deleted: false }
  User.findOne({
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    where
  }).then((user) => {
    if (user) res.send(removeFields(user))
    else res.status(404).send({ error: { name: 'Resource not found', message: 'User Not Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.post('/login', async (req, res) => {
  let user = {}
  const { username, password } = req.body
  try {
    if (username && password) {
      user = await User.findOne({
        include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
        where: { username, isActivated: true }
      })
      if (user) {
        if (compareSync(password, user.password)) {
          if (!user.isActivated) throw Error('Authentication Failed', 'Your email is not confirmed yet please go to your email and confirm')
          else if (!user.isApproved) throw Error('Authentication Failed', 'Your account is not yet approved please contact the system Admin')
          else if (user.spam || user.deleted) throw Error('Authentication Failed', 'Sorry your account has been Spammed or Deleted please contact the system Admin')
          else {
            jwt.sign({ userId: user.id, role: user.role, username: user.username }, ACCESS_TOKEN_SECRET_KEY, (error, token) => {
              if (error) res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
              res.set({ Authorization: 'Bearer ' + token, 'Access-control-expose-headers': 'Authorization' }).send(removeFields(user))
            })
          }
        } else {
          throw Error('Authentication Failed', 'Invalid Username or Password')
        }
      } else {
        throw Error('Authentication Failed', 'Invalid Username or Password')
      }
    }
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.post('/register', async (req, res) => {
  try {
    const body = req.body
    console.log(body)
    if (body.role === 'Admin') body.isApproved = true
    if (body.address) {
      if (body.address.id) {
        await Address.update(body.address, { where: { id: body.address.id } })
        body.addressId = body.address.id
        delete body.address
      } else {
        const _address = await Address.create(body.address)
        body.addressId = _address.id
        delete body.address
      }
    }
    if (!req.files || Object.keys(req.files || []).length === 0) {
      console.warn('No files were uploaded.')
    } else {
      const image = req.files.file
      const pic = await uploadFileIntoS3(image)
      const _picture = await Picture.create(pic)
      console.info(`[user] [put] _picture.id: ${_picture.id}`)
      body.pictureId = _picture.id
    }
    console.info(body)
    const _user = await User.create(body)
    if (_user) {
      sendConfirmation(_user.firstName + ' ' + _user.lastName, _user.email, _user.activationKey)
    }
    const response = await User.findOne({
      include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
      where: { id: _user.id }
    })
    res.send(removeFields(response))
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('/confirmation/:key', async (req, res) => {
  const activationKey = req.params.key
  let status = 400
  const isValid = validate(activationKey)
  try {
    if (activationKey && isValid) {
      const user = await User.findOne({ where: { activationKey } })
      if (user) {
        if (user.isActivated === false) {
          await User.update({ isActivated: true }, { where: { id: user.id } })
          res.redirect('http://localhost:3000/login/confirmed')
        } else {
          status = 406
          throw Error('Invalid/Expired Activation Link')
        }
      } else {
        status = 406
        throw Error('Invalid/Expiered Activation Link')
      }
    } else {
      status = 404
      throw Error('Invalid Resource URI')
    }
  } catch (error) {
    res.status(status).json({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })
  }
})

export default router
