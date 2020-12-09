import { Router } from 'express'
import { PriceRate, PriceBook } from '../sequelize/models'
import { authUser, getParams, removeFields } from '../middleware/auth'

const router = Router()

router.get('/:id(\\d+)', authUser, async (req, res) => {
  const where = req.params.id ? { id: req.params.id } : {}
  const pricebook = await PriceRate.findOne({ include: [{ model: PriceBook, as: 'pricebook' }], where })
    .catch((error) => {
      res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
    })
  res.send(removeFields(pricebook))
})

router.post('', async (req, res) => {
  try {
    const body = req.body
    const _pricebook = await PriceRate.create(body)
    const response = await PriceRate.findOne({ include: [{ model: PriceBook, as: 'pricebook' }], where: { id: _pricebook.id } })
    res.send(removeFields(response))
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.put('', authUser, async (req, res) => {
  const body = req.body
  try {
    if (body) {
      // console.log(body)
      if (body.id) {
        const _pricebook = await PriceRate.findOne({ where: { id: body.id }, include: [{ model: PriceBook, as: 'pricebook' }] })
        if (_pricebook) {
          body.name = body.name || _pricebook.name
          body.discoutBy = body.discoutBy || _pricebook.discoutBy
          body.discountAmount = body.discountAmount || _pricebook.discountAmount
          body.weightPrice = body.weightPrice || _pricebook.weightPrice
          body.onRoadPrice = body.onRoadPrice || _pricebook.onRoadPrice
          body.offRoadPrice = body.offRoadPrice || _pricebook.offRoadPrice
          delete body.createdAt
          delete body.updatedAt
          const rows = await PriceRate.update(body, { where: { id: body.id } })
          const result = rows ? await PriceRate.findOne({
            where: { id: body.id },
            include: [{ model: PriceBook, as: 'pricebook' }]
          }) : null
          res.status(200).send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
        } else throw Error('Bad Request: PriceRate not found')
      } else throw Error('Bad Request: PriceRate ID is Missing')
    } else throw Error('Bad Request: Your Request Body is Null')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack }, location: 'PriceRate PUT method' })
  }
})

router.get('', authUser, async (req, res) => {
  const amount = await PriceRate.count()
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const pricebooks = await PriceRate.findAll({
    where: params.where,
    include: [{ model: PriceBook, as: 'pricebook' }],
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(pricebooks))
})

router.get('/:query', authUser, getParams, async (req, res, next) => {
  const params = req.queries
  const amount = await PriceRate.count()
  const pricebooks = await PriceRate.findAll({
    include: [{ model: PriceBook, as: 'pricebook' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.set({ 'X-Total-Count': amount, 'Access-Control-Expose-Headers': 'X-Total-Count' }).send(removeFields(pricebooks))
})

export default router
