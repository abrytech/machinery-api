import { Router } from 'express'
import { authUser, checkRole, getParams, removeFields } from '../middleware/auth'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'
import { Machine, Machinery, Picture } from '../sequelize/models'
const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const id = parseInt(req.params.id)
  Machine.findOne({
    include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
    where: { id: id }
  }).then((result) => {
    if (result) {
      // result = removeFields(result.user)
      res.send(result)
    } else res.status(404).send({ error: { name: 'Resource not found', message: 'No Machine Found', stack: '' } })
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
    const _machine = await Machine.create(body)
    const response = await Machine.findOne({
      include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
      where: { id: _machine.id }
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
      const _machine = await Machine.findOne({
        include: [{ model: Picture, as: 'picture' }],
        where: { id: body.id }
      })
      if (_machine) {
        body.name = body.name || _machine.name
        body.description = body.description || _machine.description
        body.parentId = body.parentId || _machine.parentId
        body.isLowbed = body.isLowbed || _machine.isLowbed
        if (req.files || Object.keys(req.files || []).length !== 0) {
          const image = req.files.file
          if (_machine.picture) {
            if (_machine.picture.fileName) await deleteFileFromS3(_machine.picture.fileName)
            const pic = await uploadFileIntoS3(image)
            await Picture.update(pic, { where: { id: _machine.picture.id } })
          } else {
            const pic = await uploadFileIntoS3(image)
            const _picture = await Picture.create(pic)
            body.pictureId = _picture.id
          }
        }
        const rows = await Machine.update(body, { where: { id: body.id } })
        const result = rows ? await Machine.findOne({
          include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
          where: { id: body.id }
        }) : null
        res.send({ rows: rows ? rows[0] : 0, result })
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
  machines.map(machine => removeFields(machine))
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
      machines.map(machine => removeFields(machine))
      res.send(machines)
    } else throw Error('Bad Format', 'Invalid Request URL format')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

export default router
