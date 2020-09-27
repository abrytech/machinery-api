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
  })
  res.send(user)
})

router.get('/me', authUser, async (req, res) => {
  const where = { id: req.userId }
  const user = await User.findOne({
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    where
  })
  res.send(user)
})

router.post('', async (req, res) => {
  const body = req.body
  let user = {}
  console.log(body)
  user = await User.create(body)
  if (body.address) {
    const addressBody = body.address
    addressBody.userId = user.id
    user.address = await Address.create(addressBody)
  }
  if (user) {
    sendConfirmation(user.firstName + ' ' + user.lastName, user.email, user.activationKey)
  }
  res.send(user)
})

router.put('', authUser, checkRole(['Admin']), async (req, res) => {
  const body = req.body
  const respones = { isSuccess: true, updatedRows: [], message: [] }
  if (body.id) {
    if (body.address) {
      const rows = await Address.update(body.address, { where: { userId: body.id } })
      if (rows > 0) {
        respones.updatedRows.push({ address: rows })
      } else {
        respones.isSuccess = false
        respones.message.push('Failed to UPDATE address information')
      }
      delete body.address
    }
    if (body.password && body.oldPassword) {
      const user = await User.findOne({ where: { id: body.id } })
      const isMatch = compareSync(body.oldPassword, user.password)
      if (isMatch) delete body.oldPassword
      else {
        delete body.password
        delete body.oldPassword
        respones.message.push('Your old password is incorrect')
      }
    } else {
      const rows = await User.update(body, { where: { id: body.id } })
      if (rows > 0) {
        respones.updatedRows.push({ user: rows })
      } else {
        respones.isSuccess = false
        respones.message.push('Failed to UPDATE user information')
      }
    }
  }
  res.send(respones)
})

router.put('/me', authUser, async (req, res) => {
  const body = req.body
  const respones = { isSuccess: true, updatedRows: [], message: [] }
  if (req.userId === body.id) {
    if (body.address) {
      const rows = await Address.update(body.address, { where: { userId: req.userId } })
      if (rows > 0) {
        respones.updatedRows.push({ address: rows })
      } else {
        respones.isSuccess = false
        respones.message.push('Failed to UPDATE address information')
      }
      delete body.address
    }
    if (body.password && body.oldPassword) {
      const user = await User.findOne({ where: { id: req.userId } })
      const isMatch = compareSync(body.oldPassword, user.password)
      if (isMatch) delete body.oldPassword
      else {
        delete body.password
        delete body.oldPassword
        respones.message.push('Your old password is incorrect')
      }
    } else {
      const rows = await User.update(body, { where: { id: req.userId } })
      if (rows > 0) respones.updatedRows.push({ user: rows })
      else {
        respones.isSuccess = false
        respones.message.push('Failed to UPDATE user information')
      }
    }
  } else {
    const error = Error('Your not an Authorized Users, please SingIn first')
    error.name = '401 Unauthorized'
    error.status = 401
    throw error
  }
  res.send(respones)
})

export default router
