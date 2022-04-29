const db = require('../db/connectdb')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const bcrypt = require('bcryptjs')

// 表单验证交付于前端
// 用户注册
exports.userRegister = (req, res) => {
  user = req.body
  // 用户密码加密后存入数据库
  user.password = bcrypt.hashSync(user.password, 10)
  // 先检验用户名是否已存在，减少数据插入次数
  const sqlStr = 'select userid from user where username=?'
  db.query(sqlStr, user.username, (err, result) => {
    if (err) {
      return res.send({
        status: 1,
        message: err.message,
      })
    }
    if (result.length > 0) {
      return res.send({
        status: 1,
        message: '用户名已存在',
      })
    }
    // 插入数据到数据库
    const sqlStr2 = 'insert into user(username,password,phone) values (?,?,?)'
    db.query(
      sqlStr2,
      [user.username, user.password, user.phone],
      (i_err, i_result) => {
        if (i_err) {
          return res.send({
            status: 1,
            message: i_err.message,
          })
        }
        if (i_result.affectedRows == 1) {
          res.send({
            status: 0,
            message: '注册成功! 请前往登录',
          })
        }
      }
    )
  })
}

// 用户登录
// select * 待优化
exports.userLogin = (req, res) => {
  const sqlStr = 'select * from user where username=?'
  db.query(sqlStr, req.body.username, (err, result) => {
    if (err) {
      return res.send({
        status: 1,
        message: err.message,
      })
    }
    if (result.length == 0 || result[0].status == 0) {
      return res.send({
        status: 1,
        message: '用户不存在',
      })
    }
    // 进行解密之后再进行验证密码是否正确
    const compare = bcrypt.compareSync(req.body.password, result[0].password)
    if (!compare)
      return res.send({
        status: 1,
        message: '密码错误',
      })
    const user = { ...result[0], password: '' }
    const token = jwt.sign(user, config.secretKey, {
      expiresIn: config.survivalTime,
    })
    res.send({
      status: 0,
      message: '登录成功',
      token: 'Bearer ' + token,
    })
  })
}

// 手机号登录
exports.userLogin2 = (req, res) => {
  const sqlStr = 'select * from user where username=?'
  db.query(sqlStr, req.body.username, (err, result) => {
    if (err) {
      return res.send({
        status: 1,
        message: err.message,
      })
    }
    if (result.length == 0 || result[0].status == 0) {
      return res.send({
        status: 1,
        message: '用户不存在',
      })
    }
    // 进行解密之后再进行验证密码是否正确
    // console.log(result[0])
    // return res.send(req.body)
    if (result[0].phone != req.body.phone)
      return res.send({
        status: 1,
        message: '手机号错误',
      })
    const user = { ...result[0], password: '' }
    const token = jwt.sign(user, config.secretKey, {
      expiresIn: config.survivalTime,
    })
    res.send({
      status: 0,
      message: '登录成功',
      token: 'Bearer ' + token,
    })
  })
}

exports.alter = (req, res) => {
  user = req.body
  const sqlStr = 'select * from user where username=?'
  db.query(sqlStr, user.username, (err, result) => {
    if (err) {
      return res.send({
        status: 1,
        message: err.message,
      })
    }
    if (result.length == 0) {
      return res.send({
        status: 1,
        message: '用户不存在',
      })
    }
    user.password = bcrypt.hashSync(user.password, 10)
    const sqlStr2 = `update user set password = ? where username=?`
    db.query(sqlStr2, [user.password, user.username], (i_err, i_result) => {
      if (i_err) {
        return res.send({
          status: 1,
          message: i_err.message,
        })
      }
      // undo
      if (i_result.affectedRows == 1) {
        res.send('更新成功')
      }
    })
  })
}
