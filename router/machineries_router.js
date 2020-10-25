import { Router } from 'express'
import { authUser, checkRole, getParams } from '../middleware/auth'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'
import { Machinery, User, Machine, Picture } from '../sequelize/db/models'
const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const id = req.params.id
  Machinery.findOne({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'pictures' }],
    where: { id: id }
  }).then((machinery) => {
    if (machinery) res.send(machinery)
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Machinery Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.get('/me/:id(\\d+)', async (req, res) => {
  const id = req.params.id
  Machinery.findOne({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'pictures' }],
    where: { id, userId: req.userId }
  }).then((machinery) => {
    if (machinery) res.send(machinery)
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Machinery Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.post('', authUser, checkRole(['User', 'Admin']), async (req, res) => {
  const body = req.body
  try {
    if (!req.files || Object.keys(req.files || []).length === 0) {
      console.warn('No files were uploaded.')
    } else {
      const image = req.files.file
      const pic = await uploadFileIntoS3(image)
      const _picture = await Picture.create(pic)
      console.log(`[user] [put] _picture.id: ${_picture.id}`)
      body.machineId = _picture.id
    }
    const _machinery = await Machinery.create(body)
    const response = await Machinery.findAll({
      include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'pictures' }],
      where: { id: _machinery.id }
    })
    res.send(response)
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.put('', authUser, checkRole(['User', 'Admin']), async (req, res, err) => {
  const body = req.body
  try {
    if (body.id) {
      const _machinery = await Machinery.findOne({
        include: [{ model: Picture, as: 'pictures' }],
        where: { id: body.id }
      })
      if (_machinery) {
        body.machineId = body.machineId || _machinery.machineId
        body.madeIn = body.madeIn || _machinery.madeIn
        body.manufacturingYear = body.manufacturingYear || _machinery.manufacturingYear
        body.licensePlate = body.licensePlate || _machinery.licensePlate
        body.motorNo = body.motorNo || _machinery.motorNo
        body.chassieNo = body.chassieNo || _machinery.chassieNo
        body.modelNo = body.modelNo || _machinery.modelNo
        body.width = body.width || _machinery.width
        body.height = body.height || _machinery.height
        body.length = body.length || _machinery.length
        body.tyreNo = body.tyreNo || _machinery.tyreNo
        body.userId = body.userId || _machinery.userId
        body.loadingCapacity = body.loadingCapacity || _machinery.loadingCapacity
        body.withJackHammer = body.withJackHammer || _machinery.withJackHammer
        body.serialNo = body.serialNo || _machinery.serialNo
        body.horsePower = body.horsePower || _machinery.horsePower
        if (req.files || Object.keys(req.files || []).length !== 0) {
          const image = req.files.file
          if (_machinery.picture) {
            if (_machinery.picture.fileName) await deleteFileFromS3(_machinery.picture.fileName)
            const pic = await uploadFileIntoS3(image)
            await Picture.update(pic, { where: { id: _machinery.picture.id } })
          } else {
            const pic = await uploadFileIntoS3(image)
            const _picture = await Picture.create(pic)
            body.pictureId = _picture.id
          }
        }
        const rows = await Machinery.update(body, { where: { id: body.id } })
        const result = rows ? await Machinery.findOne({
          include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'pictures' }],
          where: { id: body.id }
        }) : body
        res.send({ rows: rows ? rows[0] : 0, result })
      } else throw Error('Bad Request: Machinery not found')
    } else throw Error('Bad Request: Machinery ID is Missing')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('', async (req, res) => {
  const machineries = await Machinery.findAll({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'pictures' }],
    offset: 0,
    limit: 25
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(machineries)
})

router.get('/:query', async (req, res, err) => {
  const query = req.params.query
  try {
    const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
    if (isQueryValid) {
      const params = getParams(query)
      const requests = await Machinery.findAll({
        where: params.where,
        include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'pictures' }],
        offset: (params.page - 1) * params.limit,
        limit: params.limit
      })
      res.send(requests)
    } else throw Error('Bad Format', 'Invalid Request URL format')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('/me/:query', async (req, res, err) => {
  const query = req.params.query
  try {
    const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
    if (isQueryValid) {
      const params = getParams(query)
      params.where.userId = req.userId
      const requests = await Machinery.findAll({
        where: params.where,
        include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'pictures' }],
        offset: (params.page - 1) * params.limit,
        limit: params.limit
      })
      res.send(requests)
    } else throw Error('Bad Format', 'Invalid Request URL format')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

export default router
