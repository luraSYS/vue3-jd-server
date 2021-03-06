const db = require('../db/connectdb')
const bcrypt = require('bcryptjs')

// 显示用户相关信息
exports.getUser = (req, res) => {
  const sqlStr = `select userid,username,userpic,phone,account from user where userid = ?`
  db.query(sqlStr, req.user.userid, (err, result) => {
    if (err) res.sendMessage(err)
    else {
      if (result.length > 0) res.sendMessage('获取用户信息成功', 0, result[0])
      else res.sendMessage('获取用户信息失败')
    }
  })
}

// 用户退出登录
exports.userLogout = (req, res) => {
  req.user = null
  res.send({
    status: 0,
    message: '退出登录成功',
  })
}

// 修改用户账户金额
exports.userModAccount = (req, res) => {
  const sqlStr = `update user set account=? where userid=?`
  db.query(sqlStr, [req.body.account, req.body.userid], (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.affectedRows == 1)
        return res.sendMessage('修改用户账户成功', 0)
      return res.sendMessage('修改用户账户失败')
    }
  })
}
// 修改用户头像
exports.userModProfile = (req, res) => {
  const sqlStr = `update user set userpic=? where ?`
  db.query(sqlStr, [req.body.userpic, req.query], (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.affectedRows == 1)
        return res.sendMessage('更改用户头像成功', 0)
      return res.sendMessage('更换用户头像失败')
    }
  })
}
// 修改用户名和电话
exports.userModInfo = (req, res) => {
  req.body.password = bcrypt.hashSync(req.body.password, 10)
  const sqlStr = `update user set ? where ?`
  db.query(sqlStr, [req.body, req.query], (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.affectedRows == 1)
        return res.sendMessage('修改用户信息成功', 0)
      return res.sendMessage('修改用户信息失败')
    }
  })
}
// 修改用户名
exports.userModName = (req, res) => {
  const sqlStr = `update user set username=? where userid = ?`
  db.query(sqlStr, [req.query.username, req.user.userid], (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.affectedRows == 1) return res.sendMessage('更改用户名成功', 0)
      return res.sendMessage('更改用户名失败')
    }
  })
}
// 修改用户手机号
exports.userModTel = (req, res) => {
  const sqlStr = `update user set phone=? where userid = ?`
  db.query(sqlStr, [req.query.phone, req.user.userid], (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.affectedRows == 1)
        return res.sendMessage('更改绑定手机成功', 0)
      return res.sendMessage('更改绑定手机号失败')
    }
  })
}
// 检查用户密码是否正确
exports.checkUserPsd = (req, res) => {
  const user = req.body
  const sqlStr = `select password from user where userid=?`
  db.query(sqlStr, user.userid, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length == 0 || result[0].status == 0) {
        return res.sendMessage('用户不存在')
      }
      // 先进行解密之后再进行验证密码是否正确
      const compare = bcrypt.compareSync(user.password, result[0].password)
      if (!compare) return res.sendMessage('原密码错误')
      return res.sendMessage('密码正确', 0)
    }
  })
}
// 修改密码
exports.userModPassword = (req, res) => {
  const user = req.body
  const sqlStr = `select password from user where userid=?`
  db.query(sqlStr, user.userid, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length == 0 || result[0].status == 0) {
        return res.sendMessage('用户不存在')
      }
      // 先进行解密之后再进行验证密码是否正确
      const compare = bcrypt.compareSync(user.password, result[0].password)
      if (!compare) return res.sendMessage('原密码错误')
      // 验证通过之后进行密码修改(修改前先加密)
      user.newpsd = bcrypt.hashSync(user.newpsd, 10)
      const sqlStr2 = 'update user set password = ? where userid=?'
      db.query(sqlStr2, [user.newpsd, user.userid], (i_err, i_result) => {
        if (i_err) return res.sendMessage(err)
        else {
          if (i_result.affectedRows == 1)
            return res.sendMessage('修改密码成功', 0)
          return res.sendMessage('修改密码失败')
        }
      })
    }
  })
}
// 重置密码
exports.userResetPassword = (req, res) => {
  const user = req.body
  const sqlStr = `select username from user where userid=? and phone=?`
  db.query(sqlStr, [user.userid, user.phone], (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length == 0 || result[0].status == 0) {
        return res.sendMessage('手机号码输入有误')
      }
      // 验证通过之后进行密码修改(修改前先加密)
      user.newpsd = bcrypt.hashSync(user.newpsd, 10)
      const sqlStr2 = 'update user set password = ? where userid=?'
      db.query(sqlStr2, [user.newpsd, user.userid], (i_err, i_result) => {
        if (i_err) return res.sendMessage(err)
        else {
          if (i_result.affectedRows == 1)
            return res.sendMessage('重置密码成功', 0)
          return res.sendMessage('重置密码失败')
        }
      })
    }
  })
}
