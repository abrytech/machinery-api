
import { Picture, User, Machine, Machinery } from '../../sequelize/db/models'
import { Router } from 'express'
import path from 'path'

const router = Router()

const www = process.env.WWW || './public/'

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
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new Error('No files were uploaded.')
  }
  const image = req.files.file
  const fileName = image.name.split('.')[0] + '-' + Date.now() + path.extname(image.name)
  const filePath = www + 'uploads/imgs/' + fileName
  image.mv(filePath, async (error) => {
    if (error) {
      console.log("Couldn't upload the image file")
      throw error
    } else {
      console.log('Image file succesfully uploaded.')
      const userId = req.body.userId
      const machineId = req.body.machineId
      const machineryId = req.body.machineryId
      const pic = { fileName: fileName, filePath: filePath, fileSize: image.size, mimeType: image.mimetype }
      if (userId) pic.userId = parseInt(userId)
      if (machineId) pic.machineId = parseInt(machineId)
      if (machineryId) pic.machineryId = parseInt(machineryId)
      // console.log("Image file: >> "+ JSON.stringify(pic));
      const picture = await Picture.create(pic)
      res.send(picture)
    }
  })
})

router.put('', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new Error('No files were uploaded.')
  }
  const image = req.files.file
  const fileName = image.name.split('.')[0] + '-' + Date.now() + path.extname(image.name)
  const filePath = www + 'uploads/imgs/' + fileName
  image.mv(filePath, async (error) => {
    if (error) {
      console.log("Couldn't upload the image file")
      throw error
    } else {
      console.log('Image file succesfully uploaded.')
      const userId = req.body.userId
      const machineId = req.body.machineId
      const machineryId = req.body.machineryId
      const pic = { fileName: fileName, filePath: filePath, fileSize: image.size, mimeType: image.mimetype }
      if (userId) pic.userId = parseInt(userId)
      if (machineId) pic.machineId = parseInt(machineId)
      if (machineryId) pic.machineryId = parseInt(machineryId)
      // console.log("Image file: >> "+ JSON.stringify(pic));
      const picture = await Picture.create(pic)
      res.send(picture)
    }
  })
})

export default router
