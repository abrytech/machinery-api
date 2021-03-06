import { Router } from 'express'
import { PriceRate, PriceBook } from '../sequelize/models'
import { getParams, removeFields } from '../middleware/auth'

const router = Router()

router.get('/:id(\\d+)', async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const pricebook = await PriceRate.findOne({ include: [{ model: PriceBook, as: 'pricebooks' }], where })
    .catch((error) => {
      res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
    })
  res.send(removeFields(pricebook))
})

router.post('', async (req, res) => {
  try {
    const body = req.body
    const _pricebook = await PriceRate.create(body)
    const response = await PriceRate.findOne({ include: [{ model: PriceBook, as: 'pricebooks' }], where: { id: _pricebook.id } })
    res.send(removeFields(response))
  } catch (error) {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.put('', async (req, res) => {
  const body = req.body
  try {
    if (body) {
      if (body.id) {
        const _pricerate = await PriceRate.findOne({ where: { id: body.id }, include: [{ model: PriceBook, as: 'pricebooks' }] })
        if (_pricerate) {
          body.name = body.name || _pricerate.name
          body.discoutBy = body.discoutBy || _pricerate.discoutBy
          body.discountAmount = body.discountAmount || _pricerate.discountAmount
          body.weightPrice = body.weightPrice || _pricerate.weightPrice
          body.onRoadPrice = body.onRoadPrice || _pricerate.onRoadPrice
          body.offRoadPrice = body.offRoadPrice || _pricerate.offRoadPrice
          delete body.createdAt
          delete body.updatedAt
          const rows = await PriceRate.update(body, { where: { id: body.id } }) || []
          const result = rows.length > 0 ? await PriceRate.findOne({
            where: { id: body.id },
            include: [{ model: PriceBook, as: 'pricebooks' }]
          }) : null
          res.status(200).send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
        } else throw Error('PriceRate not found')
      } else throw Error('PriceRate ID is Missing')
    } else throw Error('Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack, location: 'PriceRate PUT method' })
  }
})

router.get('', async (req, res) => {
  const amount = await PriceRate.count()
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const pricebooks = await PriceRate.findAll({
    where: params.where,
    include: [{ model: PriceBook, as: 'pricebooks' }],
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(pricebooks))
})

router.get('/:query', getParams, async (req, res, next) => {
  const params = req.queries
  const amount = await PriceRate.count()
  const pricebooks = await PriceRate.findAll({
    include: [{ model: PriceBook, as: 'pricebooks' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(pricebooks))
})

export default router
