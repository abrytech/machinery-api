import { Router } from 'express';
import { Job, User, Machine, RequestQueue } from '../../sequelize/db/models';
const router = Router()

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const job = await Job.findOne({
            include: [{ model: Machine, as: 'machine' }, { model: User, as: 'user' }, { model: RequestQueue, as: 'requests' }],
            where: { id: id }
        });
        res.send(job)
    } catch (error) {
        throw error;
    }
})

router.post('', async (req, res) => {
    let body = req.body;
    let job = {}
    console.log(body);
    try {
        job = await Job.create(body)
        res.send(job)
    } catch (error) {
        throw error;
    }
});

router.put('', async (req, res, err) => {
    const body = req.body;
    let respones = { isSuccess: true, updatedRows: [], message: [] }
    try {
        if (body.id) {
            const rows = await Job.update(body, { where: { id: body.id } });
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
