const express = require('express')

const router = express.Router()
const compilerController = require('../controller/compiler.controller')

router.get('/', compilerController.index)
router.get('/analise-lexica', compilerController.getTokens)

router.post('/analises', (req, res, next) => compilerController.getAnalysis(req, res, next))
module.exports = router
