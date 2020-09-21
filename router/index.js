import { Router } from 'express'
import user from './user/user_router'
import users from './user/users_router'
import address from './address/address_router'
import addresses from './address/addresses_router'
import file from './file/file_router'
import files from './file/files_router'
import machine from './machine/machine_router'
import machines from './machine/machines_router'
import machinery from './machinery/machinery_router'
import machineries from './machinery/machineries_router'
import job from './job/job_router'
import jobs from './job/jobs_router'
import request from './request/request_router'
import requests from './request/requests_router'

const router = Router()

router.use('/address', address)
router.use('/addresses', addresses)
router.use('/user', user)
router.use('/users', users)
router.use('/file', file)
router.use('/files', files)
router.use('/machine', machine)
router.use('/machines', machines)
router.use('/machinery', machinery)
router.use('/machineries', machineries)
router.use('/job', job)
router.use('/jobs', jobs)
router.use('/request', request)
router.use('/requests', requests)
export default router
