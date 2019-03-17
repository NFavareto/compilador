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
