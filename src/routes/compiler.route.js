const express = require('express')

const router = express.Router()
const compilerController = require('../controller/compiler.controller')

router.get('/', compilerController.index)


module.exports = router
