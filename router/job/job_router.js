import { Router } from 'express'
import { Job, User, Machine, RequestQueue } from '../../sequelize/db/models'
import { authUser } from '../../middleware/auth'

const router = Router()

router.get('/:id', authUser, async (req, res) => {
  const id = req.params.id
  const job = await Job.findOne({
    include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }],
    where: { id }
  })
  res.send(job)
})

router.get('/mine/:id', authUser, async (req, res) => {
  const id = req.params.id
  const job = await Job.findOne({
    include: [{ model: Machine, as: 'machine' }, { model: RequestQueue, as: 'requests' }],
    where: { id, userId: req.userId }
  })
  res.send(job)
})

router.post('', authUser, async (req, res) => {
  const body = req.body
  let job = {}
  console.log(body)
  job = await Job.create(body)
  res.send(job)
})

router.put('', authUser, async (req, res, err) => {
  const body = req.body
  const respones = { isSuccess: true, updatedRows: [], message: [] }
  if (body.id) {
    const rows = await Job.update(body, { where: { id: body.id } })
    if (rows > 0) {
      respones.updatedRows.push({ machine: rows })
    } else {
      respones.isSuccess = false
      respones.message.push('Failed to UPDATE machine information')
    }
  }
  res.send(respones)
})

export default router
