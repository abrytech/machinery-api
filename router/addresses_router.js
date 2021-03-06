
import { Router } from 'express'
import { Address } from '../sequelize/models'
import { getParams } from '../middleware/auth'

const router = Router()
router.get('/:id(\\d+)', async (req, res) => {
  const where = { id: req.params.id }
  Address.findOne({ where }).then((request) => {
    if (request) res.send(request)
    else res.status(404).send({ name: 'Resource not found', message: 'No Address Found', stack: '' })
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
})

router.post('', async (req, res, next) => {
  const body = req.body
  const address = await Address.create(body).catch((error) => {
    res.send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(address)
})

router.put('', async (req, res) => {
  const body = req.body
  if (body.id) {
    const _address = await Address.findOne({ where: { id: body.id } }).catch((error) => {
      res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
    })
    if (_address) {
      body.kebele = body.kebele || _address.kebele
      body.woreda = body.woreda || _address.woreda
      body.city = body.city || _address.city
      body.zone = body.zone || _address.zone
      body.region = body.region || _address.region
      body.lat = body.lat || _address.lat
      body.long = body.long || _address.long
      body.company = body.company || _address.company
      body.phone = body.phone || _address.phone
      const rows = await Address.update(body, { where: { id: body.id } })
      res.send({ rows, result: body })
    } else res.status(400).send({ name: 'Update failed', message: 'update failed b/c it couldn\'t find address in the db', stack: '' })
  } else res.status(400).send({ name: 'Update failed', message: 'update failed b/c it couldn\'t find address id', stack: '' })
})
router.get('', async (req, res) => {
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const addresses = await Address.findAll({
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(addresses)
})

router.get('/:query', getParams, async (req, res) => {
  const params = req.queries
  const addresses = await Address.findAll({
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(addresses)
})

export default router
