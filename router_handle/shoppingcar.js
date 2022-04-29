const db = require('../db/connectdb')

// 获取用户购物车信息
exports.getShoppingcar = (req, res) => {
  const strSql = `select p.detail,p.proid,p.price,p.proname,p.showpic,s.quantity,s.checked
                  from shoppingcar s left join product p on s.proid=p.proid
                  where s.userid=? and s.status=1`
  db.query(strSql, req.query.userid, (err, result) => {
    if (err) {
      return res.sendMessage(err)
    } else {
      res.sendMessage('获取用户购物车信息成功', 0, result)
    }
  })
}

// 商品添加至购物车
exports.addToCar = (req, res) => {
  data = req.body
  // 1.检查购物车中是否已有该商品信息
  const sqlStr = `select quantity,status from shoppingcar where userid=? and proid=?`
  db.query(sqlStr, [data.userid, data.proid], (err, result) => {
    if (err) {
      return res.sendMessage(err)
    } else {
      // 2-1:购物车中没有该商品信息则加入购物车
      if (result.length == 0) {
        const sqlStr2 = `insert into shoppingcar(userid,proid) values (?,?)`
        db.query(sqlStr2, [data.userid, data.proid], (i_err, i_result) => {
          if (i_err) {
            return res.sendMessage(i_err)
          } else {
            if (i_result.affectedRows == 1) {
              return res.sendMessage('添加至购物车成功', 0)
            }
          }
        })
      }
      // 2-2:购物车中有该商品则数量加1
      else {
        if (result[0].status == 0) {
          result[0].status = 1
          result[0].quantity = 1
        } else {
          result[0].quantity += 1
        }
        const sqlStr2 = `update shoppingcar set quantity=?,status=? where userid=? and proid=?`
        db.query(
          sqlStr2,
          [result[0].quantity, result[0].status, data.userid, data.proid],
          (i_err, i_result) => {
            if (i_err) {
              return res.sendMessage(i_err)
            } else {
              if (i_result.affectedRows == 1) {
                return res.sendMessage('添加至购物车成功', 0)
              }
            }
          }
        )
      }
    }
  })
}

// 删除购物车中的商品
exports.delFromCar = (req, res) => {
  const sqlStr = `update shoppingcar set status=0 where userid=? and proid=?`
  db.query(sqlStr, [req.body.userid, req.body.proid], (err, result) => {
    if (err) {
      return res.sendMessage(err)
    } else {
      if (result.affectedRows == 1) {
        return res.sendMessage('商品移出购物车成功', 0)
      }
    }
  })
}
exports.delOneFromCar = (req, res) => {
  const data = req.body
  const sqlStr = `update shoppingcar set quantity=? where userid=? and proid=?`
  db.query(
    sqlStr,
    [data.quantity - 1, data.userid, data.proid],
    (err, result) => {
      if (err) {
        return res.sendMessage(err)
      } else {
        if (result.affectedRows == 1) return res.sendMessage('操作成功', 0)
        return res.sendMessage('操作失败')
      }
    }
  )
}
