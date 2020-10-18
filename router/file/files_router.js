import { Picture, User, Machine, Machinery } from '../../sequelize/db/models'
import { Router } from 'express'
import path from 'path'
const router = Router()
const www = process.env.WWW || './public/'

router.get('/', async (req, res) => {
  const images = await Picture.findAll({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Machinery, as: 'machinery' }],
    offset: 0,
    limit: 10
  })
  res.send(images)
})

router.get('/:query', async (req, res) => {
  const query = req.params.query
  const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
  if (isQueryValid) {
    const params = getParams(query)
    const images = await Picture.findAll({
      include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Machinery, as: 'machinery' }],
      where: params.where,
      offset: (params.page - 1) * params.limit,
      limit: params.limit
    })
    res.send(images)
  } else {
    res.json({
      error: {
        name: 'Bad Format',
        message: 'Invalid Request URL format',
        stack: ''
      }
    })
  }
})

router.post('', async (req, res) => {
  const pictures = []
  let index = 0
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new Error('No files were uploaded.')
  }
  const images = req.files.files
  for (const image of images) {
    index++
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
        const picture = await Picture.create(pic)
        pictures.push(picture)
      }
    })
  }
  setTimeout(() => {
    if (index === images.length) { res.send(pictures) }
  }, 1000)
})

function getParams (query) {
  const params = { page: 1, limit: 10, where: {} }
  const temp = query.split('&')
  temp.forEach((param) => {
    const key = param.split('=')[0]
    const value = param.split('=')[1]
    if (key && value) {
      if (key === 'page' || key === 'limit') { params[key] = parseInt(value) } else {
        params.where[key] = value
      }
    }
  })
  console.log(params)
  return params
}

export default router
