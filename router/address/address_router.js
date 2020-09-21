
import { Router } from 'express';
import { User, Address } from '../../sequelize/db/models';
const router = Router()

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const address = await Address.findOne({
            include: [{ model: User, as: 'user' }],
            where: { id: id }
        });
        res.send(address)
    } catch (error) {
        throw error;
    }
})

router.post('', async (req, res, next) => {
    let body = req.body;
    let address = {}
    console.log(body);
    try {
        address = await Address.create(body)
        res.send(address)
    } catch (error) {
        throw error;
    }
});
export default router;