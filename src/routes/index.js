const express = require('express')

const router = express.Router()
const compilerRoute = require('./compiler.route')

router.use('/', compilerRoute)


module.exports = router
