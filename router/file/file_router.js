
import { Picture, User, Machine, Machinery } from '../../sequelize/db/models'
import { deleteFileFromS3, uploadFileIntoS3 } from '../../middleware/aws'
import { Router } from 'express'
// import path from 'path'

const router = Router()

// const www = process.env.WWW || './public/'

router.get('/:id', async (req, res) => {
  const image = await Picture.findOne({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Machinery, as: 'machinery' }],
    where: { id: req.params.id }
  }).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(image)
})

router.post('', async (req, res) => {
  const body = req.body
  if (!req.files || Object.keys(req.files || []).length === 0) {
    throw new Error('No files were uploaded.')
  }
  const image = req.files.file
  const pic = uploadFileIntoS3(image)
  const userId = body.userId
  const machineId = body.machineId
  const machineryId = body.machineryId
  if (userId) pic.userId = parseInt(userId)
  if (machineId) pic.machineId = parseInt(machineId)
  if (machineryId) pic.machineryId = parseInt(machineryId)
  const _picture = await Picture.create(pic)
  console.log(`[user] [put] _picture.id: ${_picture.id}`)
  res.send(_picture)
})

router.put('', async (req, res) => {
  const body = req.body
  if (!req.files || Object.keys(req.files || []).length === 0) {
    throw new Error('No files were uploaded.')
  }
  const image = req.files.file
  const pics = await Picture.findAll({ where: { userId: body.id } })
  pics.forEach(element => {
    deleteFileFromS3(element.fileName)
  })
  const pic = uploadFileIntoS3(image)
  const userId = body.userId
  const machineId = body.machineId
  const machineryId = body.machineryId
  if (userId) pic.userId = parseInt(userId)
  if (machineId) pic.machineId = parseInt(machineId)
  if (machineryId) pic.machineryId = parseInt(machineryId)
  await Picture.destroy({ where: { userId: body.id } })
  const _picture = await Picture.create(pic)
  console.log(`[user] [put] _picture.id: ${_picture.id}`)
  res.send(_picture)
})

export default router
