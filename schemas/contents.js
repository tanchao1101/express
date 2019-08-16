var mongoose = require('mongoose')
module.exports = new mongoose.Schema({
  // 关联字段
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  // 关联字段
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 添加时间
  addTime: {
    type: Date,
    default: new Date()
  },

  // 阅读量
  views: {
    type: Number,
    default: 0
  },
  // 内容标题
  title: String,
  // 内容标题
  // 简介
  description: {
    type: String,
    default: ''
  },
  // 内容
  content: {
    type: String,
    default: ''
  }
})
