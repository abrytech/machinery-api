import { Router } from 'express'
import { User, Address, Picture, Payment } from '../sequelize/models'
import { getParams, removeFields } from '../middleware/auth'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'
import sendConfirmation from '../middleware/gmail'
import { hashSync, genSaltSync, compareSync } from 'bcrypt'

const router = Router()
const include = [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }, { model: Payment, as: 'payment' }]
router.get('/:id(\\d+)', async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const user = await User.findOne({
    include,
    where
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(removeFields(user))
})

router.post('', async (req, res) => {
  try {
    const body = req.body
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
      include,
      where: { id: _user.id }
    })
    res.send(removeFields(response))
  } catch (error) {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.put('', async (req, res) => {
  const body = req.body
  try {
    if (body) {
      // console.log(body)
      if (body.id) {
        const _user = await User.findOne({ where: { id: body.id }, include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }] })
        if (_user) {
          body.firstName = body.firstName || _user.firstName
          body.lastName = body.lastName || _user.lastName
          body.email = body.email || _user.email
          body.username = body.username || _user.username
          body.phone = body.phone || _user.phone
          body.userType = body.userType || _user.userType
          body.role = body.role || _user.role
          body.isApproved = body.isApproved == null ? _user.isApproved : body.isApproved
          body.spam = body.spam == null ? _user.spam : body.spam
          body.deleted = body.deleted == null ? _user.deleted : body.deleted
          body.isActivated = body.isActivated == null ? _user.isActivated : body.isActivated
          body.activationKey = body.activationKey == null ? _user.activationKey : body.activationKey
          body.addressId = body.addressId || _user.addressId
          body.pictureId = body.pictureId || _user.pictureId
          delete body.createdAt
          delete body.updatedAt
          if (body.address) {
            if (_user.address) {
              body.address.id = body.address.id || _user.address.id
              body.address.kebele = body.address.kebele || _user.address.kebele
              body.address.woreda = body.address.woreda || _user.address.woreda
              body.address.zone = body.address.zone || _user.address.zone
              body.address.region = body.address.region || _user.address.region
              body.address.city = body.address.city || _user.address.city
              body.address.lat = body.address.lat || _user.address.lat
              body.address.long = body.address.long || _user.address.long
              body.address.company = body.address.company || _user.address.company
              body.address.phone = body.address.phone || _user.address.phone
            }
            if (body.address.id) {
              const rows = await Address.update(body.address, { where: { id: body.address.id } })
              console.log(`[update] body.address.id: ${body.address.id}, rows: ${rows}`)
            } else {
              const _address = await Address.create(body.address)
              body.addressId = _address.id
              console.log(`[new] body.addressId: ${body.addressId}`)
            }
          }

          if (req.files || Object.keys(req.files || []).length !== 0) {
            const image = req.files.file
            if (_user.picture) {
              if (_user.picture.fileName) await deleteFileFromS3(_user.picture.fileName)
              const pic = await uploadFileIntoS3(image)
              body.pictureId = _user.picture.id
              const rows = await Picture.update(pic, { where: { id: _user.picture.id } })
              console.log(`[update] body.pictureId: ${body.pictureId}, rows: ${rows}`)
            } else {
              const pic = await uploadFileIntoS3(image)
              const _picture = await Picture.create(pic)
              body.pictureId = _picture.id
              console.log(`[new] body.pictureId: ${body.pictureId}`)
            }
          }

          // if (body.password || body.oldPassword) {
          if (body.password && body.oldPassword) {
            const isMatch = compareSync(body.oldPassword, _user.password)
            console.log('isMatch: ', isMatch)
            if (isMatch) {
              body.password = hashSync(body.password, genSaltSync(8), null)
              delete body.oldPassword
            } else {
              delete body.password
              delete body.oldPassword
              res.status(400).send({ name: 'Bad Request', message: 'Your old password dont match', stack: '', location: 'User PUT method' })
            }
          } else {
            delete body.password
            delete body.oldPassword
          }
          const rows = await User.update(body, { where: { id: body.id } }) || []
          const result = rows.length > 0 ? await User.findOne({
            where: { id: body.id },
            include
          }) : null
          res.status(200).send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
        } else throw Error('User not found')
      } else throw Error('User ID is Missing')
    } else throw Error('Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack, location: 'User PUT method' })
  }
})

router.get('', async (req, res) => {
  const amount = await User.count()
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const users = await User.findAll({
    where: params.where,
    include,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(users))
})

router.get('/:query', getParams, async (req, res, next) => {
  const params = req.queries
  const amount = await User.count()
  if (req.userType === 'Lowbed Owner') params.where.userId = req.userId
  if (req.userType === 'Machinery Owner') params.where.userType = 'Lowbed Owner'
  const users = await User.findAll({
    include,
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(users))
})

export default router
