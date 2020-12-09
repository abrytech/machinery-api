import { Router } from 'express'
import users from './users_router'
import addresses from './addresses_router'
import pricebooks from './pricebook_router'
import pricerates from './pricerate_router'
import machines from './machines_router'
import machineries from './machineries_router'
import jobs from './jobs_router'
import requests from './requests_router'

const router = Router()

router.use('/addresses', addresses)
router.use('/users', users)
router.use('/pricebooks', pricebooks)
router.use('/pricerates', pricerates)
router.use('/machines', machines)
router.use('/machineries', machineries)
router.use('/jobs', jobs)
router.use('/requests', requests)
export default router
