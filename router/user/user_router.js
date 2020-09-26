import { Router } from 'express'
import { User, Address, Picture } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'
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
  const where = req.userId ? { id: req.userId } : {}
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
  res.send(user)
})

router.put('', async (req, res) => {
  const body = req.body
  const respones = { isSuccess: true, updatedRows: [], message: [] }
  if (body.id) {
    console.log(body)
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
      const isEqual = compareSync(body.oldPassword, user.password)
      delete body.oldPassword
      if (isEqual) {
        const rows = await User.update(body, { where: { id: body.id } })
        if (rows > 0) {
          respones.updatedRows.push({ user: rows })
        } else {
          respones.isSuccess = false
          respones.message.push('Failed to UPDATE user information')
        }
      }
    } else if (!(body.password || body.oldPassword)) {
      respones.isSuccess = false
      respones.message.push('Your old password is incorrect')
    } else if (body.firstName || body.lastName || body.email || body.username || body.phone || body.userType) {
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
  if (req.userId) {
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
      const isEqual = compareSync(body.oldPassword, user.password)
      delete body.oldPassword
      if (isEqual) {
        const rows = await User.update(body, { where: { id: body.id } })
        if (rows > 0) {
          respones.updatedRows.push({ user: rows })
        } else {
          respones.isSuccess = false
          respones.message.push('Failed to UPDATE user information')
        }
      }
    } else if (!(body.password || body.oldPassword)) {
      respones.isSuccess = false
      respones.message.push('Your old password is incorrect')
    } else if (body.firstName || body.lastName || body.email || body.username || body.phone || body.userType) {
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

export default router
