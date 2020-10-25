import { Router } from 'express'
import { User, Address, Picture } from '../sequelize/db/models'
import { authUser, checkRole, getParams } from '../middleware/auth'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'
import sendConfirmation from '../middleware/gmail'
import { hashSync, genSaltSync, compareSync } from 'bcrypt'

const router = Router()

router.get('/:id(\\d+)', authUser, checkRole(['User', 'Admin']), async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const user = await User.findOne({
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    where
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(user)
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
      include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
      where: { id: _user.id }
    })
    res.send(response)
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.put('', authUser, async (req, res) => {
  const body = req.body
  try {
    if (body) {
      if (body.id) {
        const _user = await User.findOne({ where: { id: body.id }, include: [{ model: Address, as: 'address' }] })
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
      } else throw Error('Bad Request: User ID is Missing')
    } else throw Error('Bad Request: Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('', authUser, checkRole(['User', 'Admin']), async (req, res) => {
  const amount = await User.count()
  const params = getParams()
  const users = await User.findAll({
    where: params.where,
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(users)
})

router.get('/:query', authUser, checkRole(['User', 'Admin']), async (req, res, err) => {
  const query = req.params.query
  try {
    const isQueryValid = (new RegExp('[?]{1}[a-zA-Z0-9%&=@.]+[a-zA-Z0-9]{1,}|[a-zA-Z0-9%&=@.]+[a-zA-Z0-9]{1,}').test(query))
    console.info('req.params.query', query, 'isQueryValid', isQueryValid)
    if (isQueryValid) {
    // console.log('getParams(query)', query)
      const params = getParams(query)
      const amount = await User.count()
      const users = await User.findAll({
        where: params.where,
        include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
        offset: (params.page - 1) * params.limit,
        limit: params.limit,
        order: [
          [params.sort, params.order]
        ]
      })
      res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(users)
    } else throw Error('Bad Format', 'Invalid Request URL format')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

export default router

// router.post('/delete/:id', authUser, checkRole(['User', 'Admin']), async (req, res) => {
//   const users = await User.destroy({
//     where: { id: req.params.id }
//   }).catch((error) => {
//     res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
//   })
//   res.send(users)
// })

// router.post('/delete', authUser, checkRole(['User', 'Admin']), async (req, res) => {
//   const users = await User.destroy({
//     where: req.body
//   }).catch((error) => {
//     res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
//   })
//   res.send(users)
// })

// router.get('/:query', authUser, checkRole(['User', 'Admin']), async (req, res, err) => {
//   const query = req.params.query
//   try {
//     const isQueryValid = (new RegExp('[?]{1}[a-zA-Z0-9%&=@.]+[a-zA-Z0-9]{1,}|[a-zA-Z0-9%&=@.]+[a-zA-Z0-9]{1,}').test(query))
//     console.info('req.params.query', query, 'isQueryValid', isQueryValid)
//     if (isQueryValid) {
//       // console.log('getParams(query)', query)
//       const params = getParams(query)
//       const amount = await User.count()
//       const users = await User.findAll({
//         where: params.where,
//         include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
//         offset: (params.page - 1) * params.limit,
//         limit: params.limit,
//         order: [
//           [params.sort, params.order]
//         ]
//       })
//       res.set({ 'X-Total-Count': amount }).send(users)
//     } else throw Error('Bad Format', 'Invalid Request URL format')
//   } catch (error) {
//     res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
//   }
// })
