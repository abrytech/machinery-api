import { Router } from 'express';
import { Job, User, Machinery, RequestQueue } from '../../sequelize/db/models';
const router = Router()

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const request = await RequestQueue.findOne({
            include: [{ model: Machinery, as: 'machinery' }, { model: User, as: 'user' }, { model: Job, as: 'job' }],
            where: { id: id }
        });
        res.send(request)
    } catch (error) {
        throw error;
    }
})

router.post('', async (req, res) => {
    let body = req.body;
    let request = {}
    console.log(body);
    try {
        request = await RequestQueue.create(body)
        res.send(request)
    } catch (error) {
        throw error;
    }
});

router.put('', async (req, res, err) => {
    const body = req.body;
    let respones = { isSuccess: true, updatedRows: [], message: [] }
    try {
        if (body.id) {
            const rows = await RequestQueue.update(body, { where: { id: body.id } });
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
