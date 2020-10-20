import { Router } from 'express'
import { Job, User, Machine, RequestQueue } from '../sequelize/db/models'
import { authUser, getParams } from '../middleware/auth'

const router = Router()

router.get('/:id', authUser, async (req, res) => {
  const id = req.params.id
  Job.findOne({
    include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }],
    where: { id }
  }).then((request) => {
    if (request) res.send(request)
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Offer Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.get('/me/:id', authUser, async (req, res) => {
  const id = req.params.id
  Job.findOne({
    include: [{ model: Machine, as: 'machine' }, { model: RequestQueue, as: 'requests' }],
    where: { id, userId: req.userId }
  }).then((request) => {
    if (request) res.send(request)
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Offer Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.post('', authUser, async (req, res) => {
  const body = req.body
  console.log(body)
  const job = await Job.create(body).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(job)
})

router.put('', authUser, async (req, res, err) => {
  const body = req.body
  try {
    if (body.id) {
      const _job = await Job.findOne({ where: { id: body.id } })
      if (_job) {
        body.title = body.title || _job.title
        body.description = body.description || _job.description
        body.pickUpDate = body.pickUpDate || _job.pickUpDate
        body.dropOffpDate = body.dropOffpDate || _job.dropOffpDate
        body.pickUpAddress = body.pickUpAddress || _job.pickUpAddress
        body.dropOffAddress = body.dropOffAddress || _job.dropOffAddress
        body.machineId = body.machineId || _job.machineId
        body.userId = body.userId || _job.userId
        body.weight = body.weight || _job.weight
        body.length = body.length || _job.length
        body.width = body.width || _job.width
        body.height = body.height || _job.height
        body.quantity = body.quantity || _job.quantity
        body.distance = body.distance || _job.distance
        body.offRoadDistance = body.offRoadDistance || _job.offRoadDistance
        body.hasOffroad = body.hasOffroad || _job.hasOffroad
        body.status = body.status || _job.status
        const rows = await Job.update(body, { where: { id: body.id } })
        const result = rows ? await Job.findOne({
          include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }],
          where: { id: body.id }
        }) : body
        res.send({ rows, result })
      } else throw Error('Bad Request: Job not found')
    } else throw Error('Bad Request: Job ID is Missing')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('', authUser, async (req, res) => {
  const jobs = await Job.findAll({
    include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }],
    offset: 0,
    limit: 25
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(jobs)
})

router.get('/:query', authUser, async (req, res, err) => {
  const query = req.params.query
  try {
    const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
    if (isQueryValid) {
      const params = getParams(query)
      const jobs = await Job.findAll({
        where: params.where,
        include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }],
        offset: (params.page - 1) * params.limit,
        limit: params.limit
      })
      res.send(jobs)
    } else throw Error('Bad Format', 'Invalid Request URL format')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

export default router
