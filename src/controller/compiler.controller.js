exports.index = async function index(req, res, next) {
  try {
    res.render('compiler')
  } catch (err) {
    next(err)
  }
}
