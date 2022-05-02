const db = require('../db/connectdb')

// 获取收货地址
exports.getAddress = (req, res) => {
  const sqlStr = `select area,detail,code,receiptid,name,phone,address,def from receipt where userid=? and status=1`
  db.query(sqlStr, req.body.userid, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length > 0)
        return res.sendMessage('获取收货地址成功', 0, result)
      res.sendMessage('获取收货地址失败')
    }
  })
}
// 添加收货地址
exports.addAddress = (req, res) => {
  const data = req.body
  const user = [data.userid, data.name, data.phone, data.address, data.code]
  const checkSql = `select status from receipt where userid=? and name=? and phone=? and address=?`
  db.query(checkSql, user, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length > 0) {
        if (result[0].status == 0) {
          // 已有数据信息status=0
          const sqlStr2 = `update receipt set status=1 where userid=? and name=? and phone=? and address=?`
          db.query(sqlStr2, user, (i_err, i_result) => {
            if (i_err) return res.sendMessage(i_err)
            else {
              if (i_result.affectedRows == 1)
                return res.sendMessage('添加收货地址成功', 0)
              return res.sendMessage('添加收货地址失败')
            }
          })
        }
        // 有重复信息status=1
        else return res.sendMessage('已有该地址信息')
      } else {
        const sqlStr = `insert into receipt (userid,name,phone,address,code) values(?,?,?,?,?)`
        db.query(sqlStr, user, (err, result) => {
          if (err) return res.sendMessage(err)
          else {
            if (result.affectedRows == 1)
              return res.sendMessage('添加收货地址成功', 0)
            res.sendMessage('添加收货地址失败')
          }
        })
      }
    }
  })
}
exports.addAddress2 = (req, res) => {
  const data = req.body
  const user = [data.userid, data.name, data.phone, data.address, data.code]
  const checkSql = `select status from receipt where userid=? and name=? and phone=? and address=?`
  db.query(checkSql, user, (err, result) => {
    // return console.log(req.body);
    if (err) return res.sendMessage(err)
    else {
      if (result.length > 0) {
        if (result[0].status == 0) {
          // 已有数据信息status=0
          const sqlStr2 = `update receipt set status=1 where userid=? and name=? and phone=? and address=?`
          db.query(sqlStr2, user, (i_err, i_result) => {
            if (i_err) return res.sendMessage(i_err)
            else {
              if (i_result.affectedRows == 1)
                return res.sendMessage('添加收货地址成功', 0)
              return res.sendMessage('添加收货地址失败')
            }
          })
        }
        // 有重复信息status=1
        else return res.sendMessage('已有该地址信息')
      } else {
        const sqlStr = `insert into receipt (address,detail,code,province,city,county,phone,name,area,def,userid) values ?`
        db.query(sqlStr, [[Object.values(req.body)]], (err, result) => {
          if (err) return res.sendMessage(err)
          else {
            if (result.affectedRows == 1)
              return res.sendMessage('添加收货地址成功', 0)
            res.sendMessage('添加收货地址失败')
          }
        })
      }
    }
  })
}
// 删除收货地址
exports.RemoveAddress = (req, res) => {
  const sqlStr = `update receipt set status=0 where receiptid=?`
  db.query(sqlStr, req.body.receiptid, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.affectedRows == 1)
        return res.sendMessage('删除收货地址成功', 0)
      res.sendMessage('删除收货地址失败')
    }
  })
}

// 设为默认收货地址
exports.setDefault = (req, res) => {
  // 先取消原默认地址
  const sqlStr = `update receipt set def=0 where def=1 and userid=?`
  db.query(sqlStr, req.body.userid, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      const sqlStr2 = `update receipt set def=1 where receiptid=?`
      db.query(sqlStr2, req.body.receiptid, (i_err, i_result) => {
        if (i_err) return res.sendMessage(i_err)
        else {
          if (i_result.affectedRows == 1)
            return res.sendMessage('设为默认地址成功', 0)
          res.sendMessage('设为默认地址失败')
        }
      })
    }
  })
}

exports.getDefault = (req, res) => {
  const sqlStr = `select receiptid from receipt where userid=? and status=1 and def=1`
  db.query(sqlStr, req.body.userid, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length > 0)
        return res.sendMessage('获取默认收货地址成功', 0, result[0])
      res.sendMessage('获取默认收货地址失败')
    }
  })
}

// 修改收货地址
exports.modAddress = (req, res) => {
  // return res.send({ a: req.body, b: req.query })
  if (req.body.def == 1) {
    const checkSql = `update receipt set def=0 where def=1 and userid=?`
    db.query(checkSql, [req.query.userid], (err2) => {
      if (err2) return res.sendMessage(err2)
      else {
        const sqlStr = `update receipt set ? where receiptid=?`
        db.query(sqlStr, [req.body, req.query.receiptid], (err, result) => {
          if (err) return res.sendMessage(err)
          else {
            if (result.affectedRows == 1)
              return res.sendMessage('修改收货地址成功', 0)
            res.sendMessage('修改收货地址失败')
          }
        })
      }
    })
  } else {
    const sqlStr = `update receipt set ? where receiptid=?`
    db.query(sqlStr, [req.body, req.query.receiptid], (err, result) => {
      if (err) return res.sendMessage(err)
      else {
        if (result.affectedRows == 1)
          return res.sendMessage('修改收货地址成功', 0)
        res.sendMessage('修改收货地址失败')
      }
    })
  }
}

// exports.addAddress
