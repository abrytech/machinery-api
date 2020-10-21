import { Router } from 'express'
import { Job, User, Machinery, RequestQueue } from '../sequelize/db/models'
import { authUser, checkRole, getParams } from '../middleware/auth'

const router = Router()

router.get('/:id', authUser, checkRole(['Admin']), async (req, res) => {
  const id = parseInt(req.params.id)
  RequestQueue.findOne({
    include: [{ model: Machinery, as: 'machinery' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
    where: { id: id }
  }).then((request) => {
    if (request) res.send(request)
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Offer Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.get('/me/:id', authUser, async (req, res) => {
  const id = req.params.id
  RequestQueue.findOne({
    include: [{ model: Machinery, as: 'machinery' }, { model: Job, as: 'job' }],
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
  const request = await RequestQueue.create(body).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(request)
})

router.put('', authUser, async (req, res, err) => {
  const body = req.body
  try {
    if (body.id) {
      const _request = await RequestQueue.findOne({ where: { id: body.id } })
      if (_request) {
        body.jobId = body.jobId || _request.jobId
        body.userId = body.userId || _request.userId
        body.lowbedId = body.lowbedId || _request.lowbedId
        body.price = body.price || _request.price
        body.status = body.status || _request.status
        const rows = await RequestQueue.update(body, { where: { id: body.id } })
        const result = rows ? await RequestQueue.findOne({
          include: [{ model: Machinery, as: 'machinery' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
          where: { id: body.id }
        }) : body
        res.send({ rows, result })
      } else throw Error('Bad Request: Offer not found')
    } else throw Error('Bad Request: Offer ID is Missing')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('', authUser, checkRole(['Admin']), async (req, res) => {
  const requests = await RequestQueue.findAll({
    include: [{ model: Machinery, as: 'machinery' }, { model: User, as: 'user' }, { model: Job, as: 'request' }],
    offset: 0,
    limit: 25
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(requests)
})

router.get('/me', authUser, async (req, res) => {
  const requests = await RequestQueue.findAll({
    include: [{ model: Machinery, as: 'machinery' }, { model: Job, as: 'request' }],
    where: { userId: req.userId },
    offset: 0,
    limit: 25
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(requests)
})

router.get('/:query', async (req, res, err) => {
  const query = req.params.query
  try {
    const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
    if (isQueryValid) {
      const params = getParams(query)
      const requests = await RequestQueue.findAll({
        where: params.where,
        include: [{ model: Machinery, as: 'machinery' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
        offset: (params.page - 1) * params.limit,
        limit: params.limit
      })
      res.send(requests)
    } else throw Error('Bad Format', 'Invalid Request URL format')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('/me/:query', authUser, async (req, res, err) => {
  const query = req.params.query
  try {
    const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
    if (isQueryValid) {
      const params = getParams(query)
      params.where.userId = req.userId
      const requests = await RequestQueue.findAll({
        where: params.where,
        include: [{ model: Machinery, as: 'machinery' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
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