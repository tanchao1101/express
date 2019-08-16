var express = require('express')
var router = express.Router()
var Category = require('../models/Category')
router.get('/', function (req, res, next) {
  Category.find().sort({_id: -1}).then(function (categories) {
    console.log(categories)
    res.render('main/index', {
      userInfo: req.userInfo,
      categories: categories
    })
  })
  // res.render('main/index', {
  //   userInfo: req.userInfo
  // })
})

module.exports = router
