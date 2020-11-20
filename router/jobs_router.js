import { Router } from 'express'
import { Job, User, Machine, RequestQueue, Picture, Address } from '../sequelize/models'
import { authUser, getParams, removeFields } from '../middleware/auth'
import { deleteFileFromS3, uploadFileIntoS3 } from '../middleware/aws'

const router = Router()

router.get('/:id(\\d+)', authUser, async (req, res) => {
  const id = req.params.id
  Job.findOne({
    include: [{ model: Machine, as: 'machine' }, { model: RequestQueue, as: 'requests' }, { model: User, as: 'user' }, { model: Picture, as: 'picture' }, { model: Address, as: 'pickUpAddress' }, { model: Address, as: 'dropOffAddress' }],
    where: { id }
  }).then((result) => {
    if (result) res.send(removeFields(result))
    else res.status(404).send({ error: { name: 'Resource not found', message: 'No Offer Found', stack: '' } })
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
})

router.post('', authUser, async (req, res) => {
  const body = req.body
  try {
    if (!req.files || Object.keys(req.files || []).length === 0) {
      console.warn('No files were uploaded.')
    } else {
      const image = req.files.file
      const pic = await uploadFileIntoS3(image)
      const _picture = await Picture.create(pic)
      console.log(`[user] [put] _picture.id: ${_picture.id}`)
      body.pictureId = _picture.id
    }
    if (body.pickUpAddress) {
      if (body.pickUpAddress.id) {
        await Address.update(body.pickUpAddress, { where: { id: body.pickUpAddress.id } })
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
        await Address.update(body.dropOffAddress, { where: { id: body.dropOffAddress.id } })
        body.dropOffId = body.dropOffAddress.id
        delete body.pickUpAddress
      } else {
        const _address = await Address.create(body.dropOffAddress)
        body.dropOffId = _address.id
        delete body.dropOffAddress
      }
    }
    const _job = await Job.create(body)
    const response = await Job.findOne({
      include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }, { model: Picture, as: 'picture' }, { model: Address, as: 'pickUpAddress' }, { model: Address, as: 'dropOffAddress' }],
      where: { id: _job.id }
    })
    res.send(removeFields(response))
  } catch (error) {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.put('', authUser, async (req, res, err) => {
  const body = req.body
  console.log(body)
  try {
    if (body.id) {
      const _job = await Job.findOne({
        include: [{ model: Picture, as: 'picture' }, { model: Address, as: 'pickUpAddress' }, { model: Address, as: 'dropOffAddress' }],
        where: { id: body.id }
      })
      if (_job) {
        body.title = body.title || _job.title
        body.description = body.description || _job.description
        body.pickUpDate = body.pickUpDate || _job.pickUpDate
        body.dropOffpDate = body.dropOffpDate || _job.dropOffpDate
        body.machineId = body.machineId || _job.machineId
        body.userId = body.userId || _job.userId
        body.weight = body.weight || _job.weight
        body.length = body.length || _job.length
        body.width = body.width || _job.width
        body.height = body.height || _job.height
        body.quantity = body.quantity || _job.quantity
        body.distance = body.distance || _job.distance
        body.offRoadDistance = body.offRoadDistance || _job.offRoadDistance
        body.hasOffroad = body.hasOffroad == null ? _job.hasOffroad : body.hasOffroad
        body.status = body.status || _job.status
        if (body.pickUpAddress) {
          if (_job.pickUpAddress) {
            body.pickUpAddress.id = body.pickUpAddress.id || _job.pickUpAddress.id
            body.pickUpAddress.kebele = body.pickUpAddress.kebele || _job.pickUpAddress.kebele
            body.pickUpAddress.woreda = body.pickUpAddress.woreda || _job.pickUpAddress.woreda
            body.pickUpAddress.city = body.pickUpAddress.city || _job.pickUpAddress.city
            body.pickUpAddress.zone = body.pickUpAddress.zone || _job.pickUpAddress.zone
            body.pickUpAddress.region = body.pickUpAddress.region || _job.pickUpAddress.region
            body.pickUpAddress.lat = body.pickUpAddress.lat || _job.pickUpAddress.lat
            body.pickUpAddress.long = body.pickUpAddress.long || _job.pickUpAddress.long
            body.pickUpAddress.company = body.pickUpAddress.company || _job.pickUpAddress.company
            body.pickUpAddress.phone = body.pickUpAddress.phone || _job.pickUpAddress.phone
          }
          if (body.pickUpAddress.id) {
            await Address.update(body.address, { where: { id: body.pickUpAddress.id } })
            console.log(`[update] body.pickUpAddress.id: ${body.pickUpAddress.id}`)
          } else {
            const _address = await Address.create(body.address)
            body.pickUpAddress = _address.id
            console.log(`[new] body.pickUpAddress: ${body.pickUpAddress}`)
          }
        }
        if (body.dropOffAddress) {
          if (_job.dropOffAddress) {
            body.dropOffAddress.id = body.dropOffAddress.id || _job.dropOffAddress.id
            body.dropOffAddress.kebele = body.dropOffAddress.kebele || _job.dropOffAddress.kebele
            body.dropOffAddress.woreda = body.dropOffAddress.woreda || _job.dropOffAddress.woreda
            body.dropOffAddress.city = body.dropOffAddress.city || _job.dropOffAddress.city
            body.dropOffAddress.zone = body.dropOffAddress.zone || _job.dropOffAddress.zone
            body.dropOffAddress.region = body.dropOffAddress.region || _job.dropOffAddress.region
            body.dropOffAddress.lat = body.dropOffAddress.lat || _job.dropOffAddress.lat
            body.dropOffAddress.long = body.dropOffAddress.long || _job.dropOffAddress.long
            body.dropOffAddress.company = body.dropOffAddress.company || _job.dropOffAddress.company
            body.dropOffAddress.phone = body.dropOffAddress.phone || _job.dropOffAddress.phone
          }
          if (body.dropOffAddress.id) {
            await Address.update(body.address, { where: { id: body.dropOffAddress.id } })
            console.log(`[update] body.dropOffAddress.id: ${body.dropOffAddress.id}`)
          } else {
            const _address = await Address.create(body.address)
            body.dropOffAddress = _address.id
            console.log(`[new] body.dropOffAddress: ${body.dropOffAddress}`)
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
        const rows = await Job.update(body, { where: { id: body.id } })
        const result = rows ? await Job.findOne({
          include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }],
          where: { id: body.id }
        }) : body
        res.send({ rows: rows ? rows[0] : 0, result: removeFields(result) })
      } else throw Error('Bad Request: Job not found')
    } else throw Error('Bad Request: Job ID is Missing')
  } catch (error) {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  }
})

router.get('', authUser, async (req, res) => {
  const params = { page: 1, limit: 25, order: 'DESC', sort: 'id', where: {} }
  const jobs = await Job.findAll({
    include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }, { model: Picture, as: 'picture' }, { model: Address, as: 'pickUpAddress' }, { model: Address, as: 'dropOffAddress' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(500).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(removeFields(jobs))
})

router.get('/:query', authUser, getParams, async (req, res) => {
  const params = req.queries
  const jobs = await Job.findAll({
    include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }, { model: Picture, as: 'picture' }, { model: Address, as: 'pickUpAddress' }, { model: Address, as: 'dropOffAddress' }],
    where: params.where,
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
    order: [
      [params.sort, params.order]
    ]
  }).catch((error) => {
    res.status(400).send({ error: { name: error.name, message: error.message, stack: error.stack } })
  })
  res.send(removeFields(jobs))
})

export default router
