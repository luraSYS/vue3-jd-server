const db = require('../db/connectdb')

// 获取订单号
exports.getOrderId = (req, res) => {
  const sqlStr = `select orderitemid,time from orders where userid=? order by orderitemid desc`
  db.query(sqlStr, req.body.userid, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length > 0) return res.sendMessage('获取订单号成功', 0, result)
      res.sendMessage('当前无订单')
    }
  })
}

// 获取订单详情表信息
exports.getOrder = (req, res) => {
  const data = req.body
  const sqlStr = `select p.proname,p.price,p.showpic,p.detail,oi.quantity,oi.orderitemid,o.pay,o.time
  from orderitem oi left join orders o on oi.orderitemid=o.orderitemid 
  left join product p on p.proid=oi.proid 
  where oi.userid=? and oi.orderitemid=?`
  db.query(sqlStr, [data.userid, data.orderitemid], (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length > 0) return res.sendMessage('获取订单号成功', 0, result)
      res.sendMessage('当前无订单')
    }
  })
}

// 添加至订单详情表
exports.addToOrderItem = (req, res) => {
  const sqlStr = `insert into orderitem(orderitemid,userid,proid,quantity,price) values (?,?,?,?,?)`
  const data = req.body
  db.query(
    sqlStr,
    [data.orderitemid, data.userid, data.proid, data.quantity, data.price],
    (err, result) => {
      if (err) return res.sendMessage(err)
      else {
        if (result.affectedRows == 1)
          return res.sendMessage('加入至订单详情表成功', 0)
        res.sendMessage('加入至订单详情表失败')
      }
    }
  )
}

// 添加至订单表
exports.addToOrder = (req, res) => {
  const sqlStr = `insert into orders(orderitemid,userid,pay,time,receiptid) values(?,?,?,?,?)`
  const data = req.body
  db.query(
    sqlStr,
    [data.orderitemid, data.userid, data.pay, data.time, data.receiptid],
    (err, result) => {
      if (err) return res.sendMessage(err)
      else {
        if (result.affectedRows == 1)
          return res.sendMessage('加入至订单成功', 0)
        res.sendMessage('加入至订单失败')
      }
    }
  )
}
