import { Router } from 'express';
import { User, Address, Picture } from '../../sequelize/db/models';
const router = Router()
import { compareSync } from 'bcrypt';

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await User.findOne({
            include: [{ model: Address, as: 'address' }, { model: Picture, as: 'picture' }],
            where: { id: id }
        });
        res.send(user)
    } catch (error) {
        throw error;
    }
})

router.post('', async (req, res) => {
    let body = req.body;
    let user = {}
    console.log(body);
    try {
        user = await User.create(body)
        if (body.address) {
            let addressBody = body.address;
            addressBody.userId = user.id;
            user.address = await Address.create(addressBody);
        }
        res.send(user)
    } catch (error) {
        throw error;
    }
});

router.put('', async (req, res, err) => {
    const body = req.body;
    let respones = { isSuccess: true, updatedRows: [], message: [] }
    try {
        if (body.id) {
            console.log(body);
            if (body.address) {
                const rows = await Address.update(body.address, { where: { userId: body.id } });
                if (rows > 0) {
                    respones.updatedRows.push({ address: rows });
                } else {
                    respones.isSuccess = false;
                    respones.message.push('Failed to UPDATE address information')
                }
                delete body.address;
            }
            if (body.password && body.oldPassword) {
                const user = await User.findOne({ where: { id: body.id } })
                const isEqual = compareSync(body.oldPassword, user.password)
                delete body.oldPassword;
                if (isEqual) {
                    const rows = await User.update(body, { where: { id: body.id } });
                    if (rows > 0) {
                        respones.updatedRows.push({ user: rows });
                    } else {
                        respones.isSuccess = false;
                        respones.message.push('Failed to UPDATE user information')
                    }
                }
            }
            else if(!(body.password || body.oldPassword)){
                respones.isSuccess = false;
                respones.message.push('Your old password is incorrect')
            }
            else if (body.firstName || body.lastName || body.email || body.username || body.phone || body.userType) {
                const rows = await User.update(body, { where: { id: body.id } });
                if (rows > 0) {
                    respones.updatedRows.push({ user: rows });
                } else {
                    respones.isSuccess = false;
                    respones.message.push('Failed to UPDATE user information')
                }
            }
        }
        res.send(respones)
    } catch (error) {
        throw error;
    }
});

export default router;
