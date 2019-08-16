var express = require('express')
var router = express.Router()
var User = require('../models/User')

var Category = require('../models/Category')
var Content = require('../models/Content')
// router.get('/use', function (req, res, next) {
//   res.send('userjjj')
// })
router.use(function (req, res, next) {
  if (!req.userInfo.isAdmin) {
    res.send('对不起，只有管理员才能进后台管理')
    return
  }
  next()
})
router.get('/', function (req, res, next) {
  res.render('admin/index', {
    userInfo: req.userInfo
  })
})
// 用户管理

router.get('/user', function (req, res, next) {
  // 从数据库中读取所有的用户数据
  // limit 限制
  // skip(2) 忽略数据的条数
  var page = Number(req.query.page || 1)
  var limit = 2
  var pages = 0
  User.count().then(function (count) {
    // 计算总页数
    pages = Math.ceil(count / limit)
    // 取值不能超过pages
    page = Math.min(page, pages)
    // 取值不能小于1
    page = Math.max(page, 1)
    var skip = (page - 1) * limit
    User.find().limit(limit).skip(skip).then(function (users) {
      // console.log(users)
      res.render('admin/index_user', {
        userInfo: req.userInfo,
        users: users,
        pageUrl: '/admin/user',
        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })
})
router.get('/category', function (req, res, next) {
  // 从数据库中读取所有的用户数据
  // limit 限制
  // skip(2) 忽略数据的条数
  //  1：升序
  // 2：降序
  var page = Number(req.query.page || 1)
  var limit = 8
  var pages = 0
  Category.count().then(function (count) {
    // 计算总页数
    pages = Math.ceil(count / limit)
    // 取值不能超过pages
    page = Math.min(page, pages)
    // 取值不能小于1
    page = Math.max(page, 1)
    var skip = (page - 1) * limit
    Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function (categories) {
      res.render('admin/category_index', {
        userInfo: req.userInfo,
        categories: categories,
        pageUrl: '/admin/category',
        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })
})
router.get('/category/add', function (req, res, next) {
  res.render('admin/category_add', {
    userInfo: req.userInfo
  })
})
router.post('/category/add', function (req, res, next) {
  var name = req.body.name || ''
  if (name === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '名称不能为空'
    })
    return
  }
  Category.findOne({
    name: name
  }).then(function (rs) {
    if (rs) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类已存在'
      })
      return Promise.reject()
    } else {
      return new Category({name: name}).save()
    }
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类保存成功',
      url: '/admin/category'
    })
  })
})
router.get('/category/edit', function (req, res, next) {
  var id = req.query.id || ''
  Category.findOne({
    _id: id
  }).then(function (category) {
    console.log(category)
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类不存在'
      })
    } else {
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category
      })
    }
  })
})
router.post('/category/edit', function (req, res, next) {
  // 获取要修改的分类的信息，并且用表单的形式展现出来
  var id = req.query.id || ''
  // 获取post提交过来的名称
  var name = req.body.name || ''
  Category.findOne({
    _id: id
  }).then(function (category) {
    console.log(category)
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类不存在'
      })
    } else {
      return Category.findOne({
        _id: {$ne: id},
        name: name
      })
    }
  }).then(function (sameCategory) {
    if (sameCategory) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '数据库中已经存在同名分类'
      })
      return Promise.reject()
    } else {
      return Category.update({
        _id: id
      }, {
        name: name
      })
    }
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '修改成功',
      url: '/admin/category'
    })
  })
})
// 分类删除
router.get('/category/delete', function (req, res, next) {
  var id = req.query.id || ''
  Category.remove({
    _id: id
  }).then(function (category) {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类删除成功'
    })
  })
})
router.get('/content', function (req, res, next) {
  // 从数据库中读取所有的用户数据
  // limit 限制
  // skip(2) 忽略数据的条数
  //  1：升序
  // 2：降序
  var page = Number(req.query.page || 1)
  var limit = 8
  var pages = 0
  Category.count().then(function (count) {
    // 计算总页数
    pages = Math.ceil(count / limit)
    // 取值不能超过pages
    page = Math.min(page, pages)
    // 取值不能小于1
    page = Math.max(page, 1)
    var skip = (page - 1) * limit
    Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category', 'user']).then(function (contents) {
      console.log(contents)
      res.render('admin/content_index', {
        userInfo: req.userInfo,
        contents: contents,
        pageUrl: '/admin/content',
        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })
})
router.get('/content/add', function (req, res, next) {
  Category.find().sort({_id: -1}).then(function (categories) {
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories
    })
  })
})
router.post('/content/add', function (req, res, next) {
  var category = req.body.category || ''
  var title = req.body.title || ''
  var description = req.body.description || ''
  var content = req.body.content || ''
  if (category === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '分类不能为空'
    })
    return
  }
  if (title === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '标题不能为空'
    })
    return
  }
  Content.findOne({
    title: title
  }).then(function (rs) {
    if (rs) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '标题已存在'
      })
      return Promise.reject()
    } else {
      return new Content({category: category, title: title, description: description, content: content, user: req.userInfo._id.toString()}).save()
    }
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '内容保存成功',
      url: '/admin/category'
    })
  })
})

router.get('/content/edit', function (req, res, next) {
  var id = req.query.id || ''
  Content.findOne({
    _id: id
  }).then(function (content) {
    console.log(content)
    if (!content) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '内容不存在'
      })
    } else {
      Category.find().sort({_id: -1}).then(function (categories) {
        res.render('admin/content_edit', {
          userInfo: req.userInfo,
          categories: categories,
          content: content
        })
      })
    }
  })
})
router.post('/content/edit', function (req, res, next) {
  var category = req.body.category || ''
  var title = req.body.title || ''
  var description = req.body.description || ''
  var content1 = req.body.content || ''
  var id = req.query.id || ''
  if (category === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '分类不能为空'
    })
    return
  }
  if (title === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '标题不能为空'
    })
    return
  }
  Content.findOne({
    _id: id
  }).then(function (content) {
    console.log(content)
    if (!content) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类不存在'
      })
    } else {
      return Content.findOne({
        _id: {$ne: id},
        title: title
      })
    }
  }).then(function (sameCategory) {
    if (sameCategory) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '数据库中已经存在同名分类'
      })
      return Promise.reject()
    } else {
      return Content.update({
        _id: id
      }, {
        category: category,
        title: title,
        description: description,
        content: content1,
        user: req.userInfo._id.toString()
      })
    }
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '内容保存成功',
      url: '/admin/category'
    })
  })
})
// 分类删除
router.get('/content/delete', function (req, res, next) {
  var id = req.query.id || ''
  Content.remove({
    _id: id
  }).then(function (category) {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '内容删除成功'
    })
  })
})
module.exports = router
