import { Router } from 'express'
import { Job, User, Machinery, RequestQueue, Picture, Address, PriceRate, PriceBook } from '../sequelize/models'
import { getParams, removeFields } from '../middleware/auth'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'

const router = Router()
const include = [{ model: Machinery, as: 'machinery' }, { model: PriceBook, as: 'pricebook' }, { model: RequestQueue, as: 'requests' }, { model: User, as: 'user' }, { model: Picture, as: 'picture' }, { model: Address, as: 'pickUpAddress' }, { model: Address, as: 'dropOffAddress' }]
const includeInt = [{ model: PriceBook, as: 'pricebook' }, { model: Picture, as: 'picture' }, { model: Address, as: 'pickUpAddress' }, { model: Address, as: 'dropOffAddress' }]

router.get('/:id(\\d+)', async (req, res) => {
  const id = req.params.id
  Job.findOne({ include, where: { id } }).then((result) => {
    if (result) res.send(removeFields(result))
    else res.status(404).send({ name: 'Resource not found', message: 'No Offer Found', stack: '' })
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
})

router.post('', async (req, res) => {
  const body = req.body
  try {
    if (!req.files || Object.keys(req.files || []).length === 0) {
      console.warn('No files were uploaded.')
    } else {
      const image = req.files.file
      const pic = await uploadFileIntoS3(image)
      const _picture = await Picture.create(pic)
      body.pictureId = _picture.id
    }
    if (body.pickUpAddress) {
      if (body.pickUpAddress.id) {
        body.pickUpId = body.pickUpAddress.id
        delete body.pickUpAddress
      } else {
        const _address = await Address.create(body.pickUpAddress)
        body.pickUpId = _address.id
        delete body.pickUpAddress
      }
    }
    if (body.dropOffAddress) {
      if (body.dropOffAddress.id) {
        body.dropOffId = body.dropOffAddress.id
        delete body.pickUpAddress
      } else {
        const _address = await Address.create(body.dropOffAddress)
        body.dropOffId = _address.id
        delete body.dropOffAddress
      }
    }
    const defaultRate = await PriceRate.findAll({ where: { isDefault: true } })
    const machinery = await Machinery.findOne({ where: { id: body.machineryId } })
    if (defaultRate.length > 0) {
      const _job = await Job.create(body)
      const rate = defaultRate[0]
      if (rate && _job) {
        const _jobPrice = { jobId: _job.id, priceRateId: rate.id, estimatedPrice: ((rate.weightPrice * machinery.weight) + (rate.onRoadPrice * _job.distance) + (rate.offRoadPrice * _job.offRoadDistance)) * _job.quantity }
        await PriceBook.create(_jobPrice)
      }
      const response = await Job.findOne({ include, where: { id: _job.id } })
      res.send(removeFields(response))
    } else {
      res.status(400).send({ name: 'Price rate error', message: 'There is no default price rate, please set default price rate first', stack: '' })
    }
  } catch (error) {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.put('', async (req, res, err) => {
  const body = req.body
  try {
    if (body.id) {
      const _job = await Job.findOne({ include: includeInt, where: { id: body.id } })
      if (_job) {
        body.title = body.title || _job.title
        body.description = body.description || _job.description
        body.pickUpDate = body.pickUpDate || _job.pickUpDate
        body.dropOffDate = body.dropOffDate || _job.dropOffDate
        body.pickUpId = body.pickUpId || _job.pickUpId
        body.dropOffId = body.dropOffId || _job.dropOffId
        body.machineryId = body.machineryId || _job.machineryId
        body.userId = body.userId || _job.userId
        body.pictureId = body.pictureId || _job.pictureId
        body.quantity = body.quantity || _job.quantity
        body.distance = body.distance || _job.distance
        body.pricebook = body.pricebook || _job.pricebook
        body.offRoadDistance = body.offRoadDistance || _job.offRoadDistance
        body.status = body.status || _job.status
        if (body.pickUpAddress) {
          if (_job.pickUpAddress) {
            body.pickUpAddress.kebele = body.pickUpAddress.kebele || _job.pickUpAddress.kebele
            body.pickUpAddress.woreda = body.pickUpAddress.woreda || _job.pickUpAddress.woreda
            body.pickUpAddress.city = body.pickUpAddress.city || _job.pickUpAddress.city
            body.pickUpAddress.zone = body.pickUpAddress.zone || _job.pickUpAddress.zone
            body.pickUpAddress.region = body.pickUpAddress.region || _job.pickUpAddress.region
            body.pickUpAddress.lat = body.pickUpAddress.lat || _job.pickUpAddress.lat
            body.pickUpAddress.long = body.pickUpAddress.long || _job.pickUpAddress.long
            body.pickUpAddress.company = body.pickUpAddress.company || _job.pickUpAddress.company
            body.pickUpAddress.phone = body.pickUpAddress.phone || _job.pickUpAddress.phone
            await Address.update(body.pickUpAddress, { where: { id: body.pickUpAddress.id } })
          } else {
            const _address = await Address.create(body.pickUpAddress)
            body.pickUpId = _address.id
          }
        }
        if (body.dropOffAddress) {
          if (_job.dropOffAddress) {
            body.dropOffAddress.kebele = body.dropOffAddress.kebele || _job.dropOffAddress.kebele
            body.dropOffAddress.woreda = body.dropOffAddress.woreda || _job.dropOffAddress.woreda
            body.dropOffAddress.city = body.dropOffAddress.city || _job.dropOffAddress.city
            body.dropOffAddress.zone = body.dropOffAddress.zone || _job.dropOffAddress.zone
            body.dropOffAddress.region = body.dropOffAddress.region || _job.dropOffAddress.region
            body.dropOffAddress.lat = body.dropOffAddress.lat || _job.dropOffAddress.lat
            body.dropOffAddress.long = body.dropOffAddress.long || _job.dropOffAddress.long
            body.dropOffAddress.company = body.dropOffAddress.company || _job.dropOffAddress.company
            body.dropOffAddress.phone = body.dropOffAddress.phone || _job.dropOffAddress.phone
            await Address.update(body.dropOffAddress, { where: { id: body.dropOffAddress.id } })
          } else {
            const _address = await Address.create(body.dropOffAddress)
            body.dropOffId = _address.id
          }
        }
        if (req.files || Object.keys(req.files || []).length !== 0) {
          const image = req.files.file
          if (_job.picture) {
            if (_job.picture.fileName) await deleteFileFromS3(_job.picture.fileName)
            const pic = await uploadFileIntoS3(image)
            await Picture.update(pic, { where: { id: _job.picture.id } })
          } else {
            const pic = await uploadFileIntoS3(image)
            const _picture = await Picture.create(pic)
            body.pictureId = _picture.id
          }
        }
        console.log('Before ::::>>>>> Job.update(body)', body, '<<<<<<<<<<<<<<<:::::::')
        const rows = await Job.update(body, { where: { id: body.id } })
        const defaultRate = await PriceRate.findAll({ where: { isDefault: true } })
        const machinery = await Machinery.findOne({ where: { id: body.machineryId } })
        const rate = defaultRate.length > 0 ? defaultRate[0] : null
        if (body.pricebook) {
          if (_job.pricebook) {
            if (rate && rows[0] > 0) {
              body.pricebook.estimatedPrice = ((rate.weightPrice * machinery.weight) + (rate.onRoadPrice * body.distance) + (rate.offRoadPrice * body.offRoadDistance)) * body.quantity
              body.pricebook.jobId = body.pricebook.jobId || _job.pricebook.jobId
              body.pricebook.priceRateId = body.pricebook.priceRateId || _job.pricebook.priceRateId
              body.pricebook.actualPrice = body.pricebook.actualPrice || _job.pricebook.actualPrice
              await PriceBook.update(body.pricebook, { where: { id: _job.pricebook.id } })
            }
          }
        } else if (rate && rows[0] > 0 && _job.pricebook) {
          const _newPrice = ((rate.weightPrice * body.weight) + (rate.onRoadPrice * body.distance) + (rate.offRoadPrice * body.offRoadDistance)) * body.quantity
          await PriceBook.update({ estimatedPrice: _newPrice }, { where: { id: _job.pricebook.id } })
        }
        const result = rows ? await Job.findOne({ include, where: { id: body.id } }) : body
        res.send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
      } else throw Error('Job not found')
    } else throw Error('Job ID is Missing')
  } catch (error) {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
  }
})

router.get('', async (req, res) => {
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const jobs = await Job.findAll({
    include,
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(removeFields(jobs))
})

router.get('/:query', getParams, async (req, res) => {
  const params = req.queries
  const jobs = await Job.findAll({
    include,
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ name: error.name, message: error.message, stack: error.stack })
  })
  res.send(removeFields(jobs))
})

export default router
