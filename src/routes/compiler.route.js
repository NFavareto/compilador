const express = require('express')

const router = express.Router()
const compilerController = require('../controller/compiler.controller')

router.get('/', compilerController.index)
router.get('/analise-lexica', compilerController.getTokens)


module.exports = router
