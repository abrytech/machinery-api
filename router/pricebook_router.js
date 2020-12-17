import { Router } from 'express'
import { PriceBook, PriceRate, Job } from '../sequelize/models'
import { getParams, removeFields } from '../middleware/auth'

const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const pricebook = await PriceBook.findOne({
    include: [{ model: PriceRate, as: 'pricerate' }, { model: Job, as: 'job' }],
    where
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(removeFields(pricebook))
})

router.post('', async (req, res) => {
  try {
    const body = req.body
    console.log(body)
    const _pricebook = await PriceBook.create(body)
    const response = await PriceBook.findOne({
      include: [{ model: PriceRate, as: 'pricerate' }, { model: Job, as: 'job' }],
      where: { id: _pricebook.id }
    })
    res.send(removeFields(response))
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.put('', async (req, res) => {
  const body = req.body
  try {
    if (body) {
      if (body.id) {
        const _pricebook = await PriceBook.findOne({ where: { id: body.id }, include: [{ model: PriceRate, as: 'pricerate' }, { model: Job, as: 'job' }] })
        if (_pricebook) {
          body.priceRateId = body.priceRateId || _pricebook.priceRateId
          body.estimatedPrice = body.estimatedPrice || _pricebook.estimatedPrice
          body.actualPrice = body.actualPrice || _pricebook.actualPrice
          delete body.createdAt
          delete body.updatedAt
          const rows = await PriceBook.update(body, { where: { id: body.id } }) || []
          const result = rows.length > 0 ? await PriceBook.findOne({
            where: { id: body.id },
            include: [{ model: PriceRate, as: 'pricerate' }, { model: Job, as: 'job' }]
          }) : null
          res.status(200).send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
        } else throw Error('Bad Request: PriceBook not found')
      } else throw Error('Bad Request: PriceBook ID is Missing')
    } else throw Error('Bad Request: Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack }, location: 'PriceBook PUT method' })
  }
})

router.get('', async (req, res) => {
  const amount = await PriceBook.count()
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const pricerates = await PriceBook.findAll({
    where: params.where,
    include: [{ model: PriceRate, as: 'pricerate' }, { model: Job, as: 'job' }],
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(pricerates))
})

router.get('/:query', getParams, async (req, res, next) => {
  const params = req.queries
  const amount = await PriceBook.count()
  const pricerates = await PriceBook.findAll({
    include: [{ model: PriceRate, as: 'pricerate' }, { model: Job, as: 'job' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(pricerates))
})

export default router
