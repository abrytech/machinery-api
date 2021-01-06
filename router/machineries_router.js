import { Router } from 'express'
import { getParams, removeFields } from '../middleware/auth'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'
import { Machinery, User, Machine, Picture } from '../sequelize/models'
const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const id = req.params.id
  Machinery.findOne({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'picture' }],
    where: { id: id }
  }).then((result) => {
    if (result) {
      res.send(removeFields(result))
    } else res.status(404).send({ name: 'Resource not found', message: 'No Machinery Found', stack: '' })
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
})

router.post('', async (req, res) => {
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
    const response = await Machinery.findOne({
      include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'picture' }],
      where: { id: _machinery.id }
    })
    res.send(removeFields(response))
  } catch (error) {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.put('', async (req, res, err) => {
  const body = req.body
  try {
    if (body.id) {
      const _machinery = await Machinery.findOne({
        include: [{ model: Picture, as: 'picture' }],
        where: { id: body.id }
      })
      if (_machinery) {
        body.machineId = body.machineId || _machinery.machineId
        body.madeIn = body.madeIn || _machinery.madeIn
        body.name = body.name || _machinery.name
        body.manufacturingYear = body.manufacturingYear || _machinery.manufacturingYear
        body.licensePlate = body.licensePlate || _machinery.licensePlate
        body.motorNo = body.motorNo || _machinery.motorNo
        body.chassieNo = body.chassieNo || _machinery.chassieNo
        body.modelNo = body.modelNo || _machinery.modelNo
        body.width = body.width || _machinery.width
        body.height = body.height || _machinery.height
        body.weight = body.weight || _machinery.weight
        body.length = body.length || _machinery.length
        body.tyreNo = body.tyreNo || _machinery.tyreNo
        body.userId = body.userId || _machinery.userId
        body.loadingCapacity = body.loadingCapacity || _machinery.loadingCapacity
        body.description = body.description || _machinery.description
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
        const rows = await Machinery.update(body, { where: { id: body.id } }) || []
        const result = rows.length > 0 ? await Machinery.findOne({
          include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'picture' }],
          where: { id: body.id }
        }) : body
        res.send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
      } else throw Error('Machinery not found')
    } else throw Error('Machinery ID is Missing')
  } catch (error) {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.get('', async (req, res) => {
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  // if (req.userType === 'Lowbed Owner') params.where.userId = req.userId
  const machineries = await Machinery.findAll({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'picture' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(removeFields(machineries))
  // res.send(removeFields(machineries.filter((machinery) => (machinery.userId === req.userId || req.role === 'Admin'))))
})

router.get('/:query', getParams, async (req, res) => {
  const params = req.queries
  // if (req.userType === 'Lowbed Owner') params.where.userId = req.userId
  const machineries = await Machinery.findAll({
    include: [{ model: User, as: 'user' }, { model: Machine, as: 'machine' }, { model: Picture, as: 'picture' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(removeFields(machineries))
  // res.send(removeFields(machineries.filter((machinery) => (machinery.userId === req.userId || req.role === 'Admin'))))
})

export default router
