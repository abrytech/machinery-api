import { Router } from 'express'
import { authUser, checkRole, getParams } from '../middleware/auth'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'
import { Machine, Machinery, Picture } from '../sequelize/db/models'
const router = Router()

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  Machine.findOne({
    include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
    where: { id: id }
  }).then((result) => {
    if (result) res.send(result)
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Machine Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.post('', authUser, checkRole(['Admin']), async (req, res) => {
  const body = req.body
  try {
    const _machine = await Machine.create(body)
    if (!req.files || Object.keys(req.files || []).length === 0) {
      console.warn('No files were uploaded.')
    } else if (_machine) {
      const image = req.files.file
      const pic = await uploadFileIntoS3(image)
      pic.machineId = _machine.id
      const _picture = await Picture.create(pic)
      console.log(`[user] [put] _picture.id: ${_picture.id}`)
    }
    const response = await Machine.findOne({
      include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
      where: { id: _machine.id }
    })
    res.send(response)
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.put('', authUser, checkRole(['Admin']), async (req, res, err) => {
  const body = req.body
  try {
    if (body.id) {
      const _machine = await Machine.findOne(body, { where: { id: body.id } })
      if (_machine) {
        body.name = body.name || _machine.name
        body.description = body.description || _machine.description
        body.parentId = body.parentId || _machine.parentId
        body.isLowbed = body.isLowbed || _machine.isLowbed
        if (req.files || Object.keys(req.files || []).length !== 0) {
          const image = req.files.file
          const pics = await Picture.findAll({ where: { machineId: body.id } })
          pics.forEach(element => {
            if (element.fileName) deleteFileFromS3(element.fileName)
          })
          const pic = await uploadFileIntoS3(image)
          pic.machineId = body.id
          pics.length > 0 ? await Picture.update(pic, { where: { machineId: body.id } }) : await Picture.create(pic)
        }
        const rows = await Machine.update(body, { where: { id: body.id } })
        const result = await Machine.findOne({
          include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
          where: { id: body.id }
        })
        res.send({ rows, result })
      } else throw Error('Bad Request: Machine not found')
    } else throw Error('Bad Request: Machine ID is Missing')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('', async (req, res) => {
  const machines = await Machine.findAll({
    include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
    offset: 0,
    limit: 25
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(machines)
})

router.get('/:query', async (req, res, err) => {
  const query = req.params.query
  try {
    const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
    if (isQueryValid) {
      const params = getParams(query)
      const machines = await Machine.findAll({
        where: params.where,
        include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
        offset: (params.page - 1) * params.limit,
        limit: params.limit
      })
      res.send(machines)
    } else throw Error('Bad Format', 'Invalid Request URL format')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

export default router
