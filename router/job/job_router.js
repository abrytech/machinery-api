import { Router } from 'express'
import { Job, User, Machine, RequestQueue } from '../../sequelize/db/models'
const router = Router()

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  const job = await Job.findOne({
    include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }, { model: RequestQueue, as: 'requests' }],
    where: { id: id }
  })
  res.send(job)
})

router.post('', async (req, res) => {
  const body = req.body
  let job = {}
  console.log(body)
  job = await Job.create(body)
  res.send(job)
})

router.put('', async (req, res, err) => {
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
