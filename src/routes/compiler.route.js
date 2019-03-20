const express = require('express')

const router = express.Router()
const compilerController = require('../controller/compiler.controller')

router.get('/', compilerController.index)

router.post('/analises', (req, res, next) => compilerController.getLexicalAnalysis(req, res, next))

module.exports = router
