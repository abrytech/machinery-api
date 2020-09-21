import { Router } from 'express';
import { Machine, Machinery, Picture } from '../../sequelize/db/models';
const router = Router()

router.get('', async (req, res) => {
    try {
        const machines = await Machine.findAll({
            include: [{ model: Machinery, as: 'machinery' }, { model: Picture, as: 'picture'}],
            offset: 0,
            limit: 10
        });
        res.send(machines)
    } catch (error) {
        throw error;
    }
})
router.get('/:query', async (req, res, err) => {
    const query = req.params.query;
    const isQueryValid = !(new RegExp("[^a-zA-Z0-9&=@.]").test(query))
    if (isQueryValid) {
        const params = getParams(query)
        const machines = await Machine.findAll({
            where: params.where,
            include: [{ model: Machinery, as:'machinery' }, { model: Picture, as:'picture' }],
            offset: (params.page - 1) * params.limit,
            limit: params.limit
        });
        res.send(machines)
    }
    else {
        res.json({
            error: {
                name: "Bad Format",
                message: "Invalid Request URL format",
                stack: ""
            }
        })
    }
});

function getParams(query) {
    let params = { 'page': 1, limit: 10, 'where': {} };
    const temp = query.split("&");
    temp.forEach((param) => {
        const key = param.split("=")[0];
        const value = param.split("=")[1];
        if (key && value) {
            if (key === "page" || key === "limit")
                params[key] = parseInt(value)
            else {
                params['where'][key] = value
            }
        }
    });
    console.log(params);
    return params;
}

export default router;
