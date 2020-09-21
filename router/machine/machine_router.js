import { Router } from 'express';
import { Machine, Machinery, Picture } from '../../sequelize/db/models';
const router = Router()

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const machine = await Machine.findOne({
            include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture' }],
            where: { id: id }
        });
        res.send(machine)
    } catch (error) {
        throw error;
    }
})

router.post('', async (req, res) => {
    let body = req.body;
    let machine = {}
    console.log(body);
    try {
        machine = await Machine.create(body)
        res.send(machine)
    } catch (error) {
        throw error;
    }
});

router.put('', async (req, res, err) => {
    const body = req.body;
    let respones = { isSuccess: true, updatedRows: [], message: [] }
    try {
        if (body.id) {
            const rows = await Machine.update(body, { where: { id: body.id } });
                if (rows > 0) {
                    respones.updatedRows.push({ machine: rows });
                } else {
                    respones.isSuccess = false;
                    respones.message.push('Failed to UPDATE machine information')
                }
        }
        res.send(respones)
    } catch (error) {
        throw error;
    }
});

export default router;
