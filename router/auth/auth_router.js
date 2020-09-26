
import { Router } from 'express'
import { User, Address, Picture } from '../../sequelize/db/models'
import { compareSync } from 'bcrypt'
import jwt from 'jsonwebtoken'
const { ACCESS_TOKEN_SECRET_KEY } = process.env
const router = Router()
router.post('/login', async (req, res) => {
  let user = {}
  const { username, password } = req.body
  if (username && password) {
    user = await User.findOne({
      include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
      where: { username }
    })
    if (user) {
      if (compareSync(password, user.password)) {
        jwt.sign({ userId: user.id, userType: user.userType }, ACCESS_TOKEN_SECRET_KEY, (err, token) => {
          if (err) throw err
          res.set({ Authorization: 'Bearer ' + token }).send(user)
        })
      }
    }
  }
})
export default router
