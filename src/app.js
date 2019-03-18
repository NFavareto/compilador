const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const vars = require('./config/vars')
const routes = require('./routes/index')

const app = express()

app.listen(vars.port)

const views = [
  path.join(__dirname, 'views'),
]
app.set('views', views)
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.use('/', routes)

app.use(express.static(path.join(__dirname, './static')))

/**
 * Exports express
 * @public
 */

module.exports = app
