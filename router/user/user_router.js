import { Router } from 'express'
import { User, Address, Picture } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'
import sendConfirmation from '../../middleware/gmail'
import { compareSync } from 'bcrypt'
const router = Router()

router.get('/:id', authUser, checkRole(['Admin']), async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const user = await User.findOne({
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    where
  }).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(user)
})

router.get('/me', authUser, async (req, res) => {
  const where = { id: req.userId }
  const user = await User.findOne({
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    where
  }).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(user)
})

router.post('', async (req, res) => {
  const body = req.body
  let user = {}
  console.log(body)
  if (body.role === 'Admin') body.isApproved = true
  user = await User.create(body).catch((error) => {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  if (body.address) {
    const addressBody = body.address
    addressBody.userId = user.id
    user.address = await Address.create(addressBody).catch((error) => {
      res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
    })
  }
  if (user) {
    sendConfirmation(user.firstName + ' ' + user.lastName, user.email, user.activationKey)
  }
  res.send(user)
})

router.put('', authUser, checkRole(['Admin']), async (req, res) => {
  const body = req.body
  try {
    if (body) {
      if (body.id) {
        const _user = await User.findOne({
          where: { id: body.id },
          include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }]
        })
        _user.firstName = body.firstName || _user.firstName
        _user.lastName = body.lastName || _user.lastName
        _user.email = body.email || _user.email
        _user.username = body.username || _user.username
        _user.phone = body.phone || _user.phone
        _user.userType = body.userType || _user.userType
        _user.role = body.role || _user.role
        _user.isApproved = body.isApproved || _user.isApproved
        _user.spam = body.spam || _user.spam
        _user.deleted = body.deleted || _user.deleted
        _user.isActivated = body.isActivated || _user.isActivated
        _user.activationKey = body.activationKey || _user.activationKey
        _user.picture = _user.picture || body.picture
        delete _user.updatedAt
        delete _user.createdAt
        if (body.address) {
          if (_user.address) {
            _user.address.id = body.address.id || _user.address.id
            _user.address.kebele = body.address.kebele || _user.address.kebele
            _user.address.woreda = body.address.woreda || _user.address.woreda
            _user.address.zone = body.address.zone || _user.address.zone
            _user.address.city = body.address.city || _user.address.city
            _user.address.company = body.address.company || _user.address.company
            _user.address.phone = body.address.phone || _user.address.phone
            _user.address.userId = _user.address.userId || body.id
            delete _user.address.updatedAt
            delete _user.address.createdAt
          } else {
            _user.address = body.address
            _user.address.userId = body.id
          }
          if (_user.address.id) await Address.update(_user.address, { where: { id: _user.address.id } })
          else _user.address = await Address.create(_user.address)
        }
        if (body.password && body.oldPassword) {
          const isMatch = compareSync(body.oldPassword, _user.password)
          if (isMatch) {
            _user.password = body.password
          }
        }
        await User.update(_user, { where: { id: _user.id } })
        res.send(_user)
      } else throw Error('Bad Request: User ID is Missing')
    } else throw Error('Bad Request: Your Request Body is Null')
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

export default router
