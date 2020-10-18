import { User, Address, Picture } from '../../sequelize/db/models'
import { authUser, checkRole } from '../../middleware/auth'
import sendConfirmation from '../../middleware/gmail'
import { compareSync } from 'bcrypt'
import path from 'path'
import fs from 'fs'
import { Router } from 'express'

const router = Router()
const www = process.env.WWW || './public/'

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
  if (body.role === 'Admin') body.isApproved = true
  const _user = await User.create(body).catch((error) => {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  if (body.address) {
    const addressBody = body.address
    addressBody.userId = _user.id
    _user.address = await Address.create(addressBody).catch((error) => {
      res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
    })
  }
  if (_user) {
    sendConfirmation(_user.firstName + ' ' + _user.lastName, _user.email, _user.activationKey)
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new Error('No files were uploaded.')
  } else if (_user) {
    const image = req.files.file
    const fileName = image.name.split('.')[0] + '-' + Date.now() + path.extname(image.name)
    const filePath = www + 'uploads/images/' + fileName
    image.mv(filePath, async (error) => {
      if (error) {
        console.log("Couldn't upload the image file")
        throw error
      } else {
        console.log('Image file succesfully uploaded.')
        const machineId = req.body.id
        const pic = { fileName: fileName, filePath: filePath, fileSize: image.size, mimeType: image.mimetype }
        if (machineId) pic.machineId = parseInt(machineId)
        const _picture = await Picture.create(pic)
        console.log(`[user] [post] _picture?.id ${_picture.id}`)
      }
    })
  }
  const response = await User.findOne({
    include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
    where: { id: _user.id }
  })
  res.send(response)
})

router.put('', authUser, checkRole(['Admin']), async (req, res) => {
  const body = req.body
  let _user = {}
  try {
    if (body) {
      if (body.id) {
        _user = await User.findOne({
          where: { id: body.id },
          include: [{ model: Address, as: 'address' }]
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
          if (_user.address.id) {
            await Address.update(_user.address, { where: { id: _user.address.id } })
            console.log(`[update] _user.address.id: ${_user.address.id}`)
          } else {
            const _address = await Address.create(_user.address)
            console.log(`[new] _address.id: ${_address.id}`)
          }
        }
        if (req.files || Object.keys(req.files).length !== 0) {
          const image = req.files.file
          const fileName = image.name.split('.')[0] + '-' + Date.now() + path.extname(image.name)
          const filePath = www + 'uploads/images/' + fileName
          image.mv(filePath, async (error) => {
            if (error) {
              console.log("Couldn't upload the image file")
              throw error
            } else {
              console.log('Image file succesfully uploaded.')
              const userId = req.body.id
              const pic = { fileName: fileName, filePath: filePath, fileSize: image.size, mimeType: image.mimetype }
              if (userId) pic.userId = parseInt(userId)
              const pics = await Picture.findAll({ where: { userId: body.id } })
              pics.forEach(element => { fs.unlink(element.filePath) })
              await Picture.destroy({ where: { userId: body.id } })
              const _picture = await Picture.create(pic)
              console.log(`[user] [put] _picture?.id: ${_picture.id}`)
            }
          })
        }
        if (body.password && body.oldPassword) {
          const isMatch = compareSync(body.oldPassword, _user.password)
          if (isMatch) {
            _user.password = body.password
          }
        }
        const _newuser = await User.update(_user, { where: { id: _user.id } })
        console.log(`_newuser.id: ${_newuser.id}`)
        const response = await User.findOne({
          where: { id: body.id },
          include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }]
        })
        res.send(response)
      } else throw Error('Bad Request: User ID is Missing')
    } else throw Error('Bad Request: Your Request Body is Null')
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

export default router
