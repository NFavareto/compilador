const tokenController = require('./token.controller')

exports.index = async function index(req, res, next) {
  try {
    res.render('compiler')
  } catch (err) {
    next(err)
  }
}


exports.getTokens = async function getTokens(req, res, next) {
  try {
    res.render('tokens')
  } catch (err) {
    next(err)
  }
}
exports.getAnalysis = async function getAnalyze(req, res, next) {
  try {
    const body = req.body
    const lexeme = body.codigo.toString().split('<div>')

    // modificar '&gt', '&lt' e '&amp' e quebrando em linhas
    for (let i = 0; i < lexeme.length; i++) { lexeme[i] = lexeme[i].replace('</div>', '').replace('&gt;', '>').replace('&lt;', '<').replace('&amp;&amp;', '&&') }

    const tokens = await tokenController.getTokenTable(lexeme)
    const analysis = {
      lexical: tokens,
      syntax: '',
    }

    res.send(analysis)
  } catch (err) {
    next(err)
  }
}
