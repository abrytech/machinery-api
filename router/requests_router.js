import { Router } from 'express'
import { Job, User, Machinery, RequestQueue } from '../sequelize/models'
import { removeFields } from '../middleware/auth'

const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const id = parseInt(req.params.id)
  RequestQueue.findOne({
    include: [{ model: Machinery, as: 'lowbed' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
    where: { id: id }
  }).then((result) => {
    if (result) {
      result = removeFields(result)
      res.send(result)
    } else res.status(404).send({ error: { name: 'Resource not found', message: 'No Offer Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.post('', async (req, res) => {
  const body = req.body
  console.log(body)
  const request = await RequestQueue.create(body).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  const result = request ? await RequestQueue.findOne({
    include: [{ model: Machinery, as: 'lowbed' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
    where: { id: request.id }
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }) : null
  res.send(removeFields(result))
})

router.put('', async (req, res) => {
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
        const rows = await RequestQueue.update(body, { where: { id: body.id } }) || []
        const result = rows.length > 0 ? await RequestQueue.findOne({
          include: [{ model: Machinery, as: 'lowbed' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
          where: { id: body.id }
        }) : body
        res.send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
      } else throw Error('Bad Request: Offer not found')
    } else throw Error('Bad Request: Offer ID is Missing')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('/', async (req, res) => {
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const requests = await RequestQueue.findAll({
    include: [{ model: Machinery, as: 'lowbed' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(removeFields(requests))
})

router.get('/:query', async (req, res) => {
  const params = req.queries
  params.where.userId = req.userId
  const requests = await RequestQueue.findAll({
    include: [{ model: Machinery, as: 'lowbed' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  if (requests) {
    if (requests.length > 0) {
      if (req.userType === 'Lowbed Owner') {
        const reqst = requests.filter((request) => (request.userId === req.userId))
        res.send(removeFields(reqst))
      } else if (req.userType === 'Machinery Owner') {
        const reqst = requests.filter((request) => (request.job.userId === req.userId))
        res.send(removeFields(reqst))
      } else if (req.userType === 'Admin') {
        res.send(removeFields(requests))
      }
    }
  }
})

export default router
