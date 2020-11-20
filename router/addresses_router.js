
import { Router } from 'express'
import { User, Address, Job } from '../sequelize/models'
import { authUser, getParams } from '../middleware/auth'

const router = Router()
router.get('/:id(\\d+)', authUser, async (req, res) => {
  const where = { id: req.params.id }
  Address.findOne({ where }).then((request) => {
    if (request) res.send(request)
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Offer Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.get('/me', authUser, async (req, res) => {
  const where = { id: req.userId }
  const address = await Address.findOne({ where }).catch((error) => {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(address)
})

router.post('', async (req, res, next) => {
  const body = req.body
  console.log(body)
  const address = await Address.create(body).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(address)
})

router.put('', async (req, res, next) => {
  const body = req.body
  // let rows results
  if (body.id) {
    const _address = await Address.findOne({ where: { id: body.id } }).catch((error) => {
      res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
    })
    if (_address) {
      body.id = body.id || _address.id
      body.kebele = body.kebele || _address.kebele
      body.woreda = body.woreda || _address.woreda
      body.zone = body.zone || _address.zone
      body.city = body.city || _address.city
      body.lat = body.lat || _address.lat
      body.long = body.long || _address.long
      body.company = body.company || _address.company
      body.phone = body.phone || _address.phone

      const rows = await Address.update(body, { where: { id: body.id } })
      res.send({ rows, result: body })
    } else res.status(400).send({ error: { name: 'Update failed', message: 'update failed b/c it couldn\'t find address in the db', stack: '' } })
  } else res.status(400).send({ error: { name: 'Update failed', message: 'update failed b/c it couldn\'t find address id', stack: '' } })
})
router.get('', authUser, async (req, res) => {
  const addresses = await Address.findAll({ offset: 0, limit: 25 }).catch((error) => {
    res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(addresses)
})

router.get('/:query', authUser, async (req, res, err) => {
  const query = req.params.query
  const isQueryValid = !(new RegExp('[^a-zA-Z0-9&=@.]').test(query))
  if (isQueryValid) {
    const params = getParams(query)
    const addresses = await Address.findAll({
      where: params.where,
      include: [{ model: User, as: 'user' }, { model: Job, as: 'job' }],
      offset: (params.page - 1) * params.limit,
      limit: params.limit
    }).catch((error) => {
      res.send({ error: { name: error.name, message: error.message, stack: error.stack } })
    })
    res.send(addresses)
  } else {
    res.json({
      error: {
        message: 'Bad Request URL format',
        stack: ''
      }
    })
  }
})

export default router
