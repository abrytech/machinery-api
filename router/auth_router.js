
import { Router } from 'express'
import { User, Address, Picture } from '../sequelize/models'
import { compareSync, genSaltSync, hashSync } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { validate } from 'uuid'
import { authUser } from '../middleware/auth'
import sendConfirmation from '../middleware/gmail'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'
const { ACCESS_TOKEN_SECRET_KEY } = process.env
const router = Router()

router.get('/me', authUser, async (req, res) => {
  const where = { id: req.userId, isApproved: true, isActivated: true, spam: false, deleted: false }
  User.findOne({
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    where
  }).then((user) => {
    if (user) res.send(user)
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
              res.set({ Authorization: 'Bearer ' + token, 'Access-control-expose-headers': 'Authorization' }).send(user)
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
    if (body.role === 'Admin') body.isApproved = true
    if (body.address) {
      const _address = await Address.create(body.address)
      delete body.address
      body.addressId = _address
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
    const _user = await User.create(body)
    if (_user) {
      sendConfirmation(_user.firstName + ' ' + _user.lastName, _user.email, _user.activationKey)
    }
    const response = await User.findOne({
      include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
      where: { id: _user.id }
    })
    res.status(200).send(response)
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.put('/me', authUser, async (req, res) => {
  const body = req.body
  try {
    if (body) {
      if (body.id === req.userId) {
        const where = { id: body.id, isApproved: true, isActivated: true, spam: false, deleted: false }
        const _user = await User.findOne({ where, include: [{ model: Address, as: 'address' }] })
        if (_user) {
          body.firstName = body.firstName || _user.firstName
          body.lastName = body.lastName || _user.lastName
          body.email = body.email || _user.email
          body.username = body.username || _user.username
          body.phone = body.phone || _user.phone
          body.userType = body.userType || _user.userType
          body.role = body.role || _user.role
          body.isApproved = body.isApproved || _user.isApproved
          body.spam = body.spam || _user.spam
          body.deleted = body.deleted || _user.deleted
          body.isActivated = body.isActivated || _user.isActivated
          body.activationKey = body.activationKey || _user.activationKey
          if (body.address) {
            if (_user.address) {
              body.address.id = body.address.id || _user.address.id
              body.address.kebele = body.address.kebele || _user.address.kebele
              body.address.woreda = body.address.woreda || _user.address.woreda
              body.address.zone = body.address.zone || _user.address.zone
              body.address.city = body.address.city || _user.address.city
              body.address.company = body.address.company || _user.address.company
              body.address.phone = body.address.phone || _user.address.phone
            }
            if (body.address.id) {
              await Address.update(body.address, { where: { id: body.address.id } })
              console.log(`[update] body.address.id: ${body.address.id}`)
            } else {
              const _address = await Address.create(body.address)
              body.addressId = _address.id
              console.log(`[new] body.addressId: ${body.addressId}`)
            }
            delete body.address
          }

          if (req.files || Object.keys(req.files || []).length !== 0) {
            const image = req.files.file
            if (_user.picture) {
              if (_user.picture.fileName) await deleteFileFromS3(_user.picture.fileName)
              const pic = await uploadFileIntoS3(image)
              await Picture.update(pic, { where: { id: _user.picture.id } })
            } else {
              const pic = await uploadFileIntoS3(image)
              const _picture = await Picture.create(pic)
              body.pictureId = _picture.id
            }
          }

          if (body.password || body.oldPassword) {
            if (body.password && body.oldPassword) {
              const isMatch = compareSync(body.oldPassword, _user.password)
              console.log('isMatch: ', isMatch)
              if (isMatch) {
                body.password = hashSync(body.password, genSaltSync(8), null)
                delete body.oldPassword
              } else {
                delete body.password
                delete body.oldPassword
              }
            } else {
              delete body.password
              delete body.oldPassword
            }
          }
          const _newuser = await User.update(body, { where: { id: body.id } })
          console.log(`[put] _newuser: ${_newuser}`)
          const response = await User.findOne({
            where: { id: body.id },
            include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }]
          })
          res.send(response)
        } else throw Error('Bad Request: User not found')
      } else throw Error('Bad Request: Invalid User ID')
    } else throw Error('Bad Request: Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
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
