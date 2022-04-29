const db = require('../db/connectdb')
const R = require('../recommend/index')

// 获取精品推荐相关商品信息
exports.getBoutique = (req, res) => {
  const sqlStr = `select proid,proname,detail,showpic,price from product 
     where platid=? and status=1 order by proid desc 
     limit 8 offset ${(req.query.page - 1) * 8}`
  db.query(sqlStr, 1, (err, result) => {
    if (err) {
      return res.sendMessage(err)
    }
    if (result.length > 0) {
      res.sendMessage('获取精品推荐成功', 0, result)
    }
  })
}

// 获取热门商品信息
exports.getHot = (req, res) => {
  const sqlStr = `select proid,proname,detail,showpic,price from product 
     where platid=? and status=1 order by proid desc 
     limit 8 offset ${(req.query.page - 1) * 8}`
  db.query(sqlStr, 2, (err, result) => {
    if (err) {
      return res.sendMessage(err)
    }
    if (result.length > 0) {
      res.sendMessage('获取热门商品成功', 0, result)
    }
  })
}

//获得活动商品信息
exports.getPromotion = (req, res) => {
  const sqlStr = `select proid,proname,detail,showpic,price from product 
     where platid=? and status=1 order by proid desc 
     limit 8 offset ${(req.query.page - 1) * 8}`
  db.query(sqlStr, 3, (err, result) => {
    if (err) {
      return res.sendMessage(err)
    }
    if (result.length > 0) {
      res.sendMessage('获取活动商品成功', 0, result)
    }
  })
}

// 获取数码产品类商品
exports.getDigital = (req, res) => {
  // 第一次请求数据得返回总数来确定页数
  if (req.query.page == 1) {
    const sqlTot = `select count(*) from product
    where cateid=? and status=1 order by proid desc`
    db.query(sqlTot, 1, (err, result) => {
      if (err) {
        return res.sendMessage(err)
      } else {
        const count = result[0]['count(*)']
        getpage(req, res, 1, count)
      }
    })
  } else {
    getpage(req, res, 1)
  }
}

// 获取精品图书类商品
exports.getBooks = (req, res) => {
  // 第一次请求数据得返回总数来确定页数
  if (req.query.page == 1) {
    const sqlTot = `select count(*) from product
    where cateid=? and status=1 order by proid desc`
    db.query(sqlTot, 2, (err, result) => {
      if (err) {
        return res.sendMessage(err)
      } else {
        const count = result[0]['count(*)']
        getpage(req, res, 2, count)
      }
    })
  } else {
    getpage(req, res, 2)
  }
}

// 获取时尚衣服类商品
exports.getCloths = (req, res) => {
  // 第一次请求数据得返回总数来确定页数
  if (req.query.page == 1) {
    const sqlTot = `select count(*) from product
    where cateid=? and status=1 order by proid desc`
    db.query(sqlTot, 3, (err, result) => {
      if (err) {
        return res.sendMessage(err)
      } else {
        const count = result[0]['count(*)']
        getpage(req, res, 3, count)
      }
    })
  } else {
    getpage(req, res, 3)
  }
}

// 获取美食甜品类商品
exports.getFood = (req, res) => {
  // 第一次请求数据得返回总数来确定页数
  if (req.query.page == 1) {
    const sqlTot = `select count(*) from product
    where cateid=? and status=1 order by proid desc`
    db.query(sqlTot, 4, (err, result) => {
      if (err) {
        return res.sendMessage(err)
      } else {
        const count = result[0]['count(*)']
        getpage(req, res, 4, count)
      }
    })
  } else {
    getpage(req, res, 4)
  }
}

// 获取家用电器类商品
exports.getDevice = (req, res) => {
  // 第一次请求数据得返回总数来确定页数
  if (req.query.page == 1) {
    const sqlTot = `select count(*) from product
    where cateid=? and status=1 order by proid desc`
    db.query(sqlTot, 5, (err, result) => {
      if (err) {
        return res.sendMessage(err)
      } else {
        const count = result[0]['count(*)']
        getpage(req, res, 5, count)
      }
    })
  } else {
    getpage(req, res, 5)
  }
}

// 获取商品详情信息
exports.getDetail = (req, res) => {
  const sqlStr = `select proid,proname,detail,price,showpic,showpic2,showpic3 from product where proid=?`
  db.query(sqlStr, req.query.proid, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      if (result.length > 0)
        return res.sendMessage('获取商品详细成功', 0, result[0])
    }
    return res.sendMessage('获取商品详情失败')
  })
}

exports.getRecommend = (req, res) => {
  // console.log(req.query)
  // 1.获取所有订单信息作为用户喜好计算标准
  const sqlStr = `select userid,proid from orderitem`
  db.query(sqlStr, (err, result) => {
    if (err) return res.sendMessage(err)
    else {
      var data = JSON.parse(
        JSON.stringify(result)
          .replace(/userid/g, 'userId')
          .replace(/proid/g, 'goodsId')
      )
      let i = parseInt(req.query.userid)
      const recommendGoodsService = new R.RecommendGoodsService(
        data,
        parseInt(req.query.userid),
        10
      )
      // 2.获取到推荐的商品id号列表recommendList
      const recommendList = recommendGoodsService.start()
      // 3.从数据库中获取推荐商品信息(每次取8条)
      const sqlStr2 = `select proid,proname,detail,showpic,price from product
      where proid in (${recommendList}) 
      order by field(proid,${recommendList})
      limit 8 offset ${(req.query.page - 1) * 8}
      `
      // return res.send(sqlStr2)
      db.query(sqlStr2, (err2, result2) => {
        if (err2) return res.sendMessage(err2)
        else {
          if (result2.length > 0)
            return res.sendMessage('获取推荐商品成功', 0, result2)
          return res.sendMessage('获取推荐商品失败')
        }
      })
    }
  })
}

// 获取分页数据
function getpage(req, res, cateid, count = 0) {
  const sqlStr = `select proid,proname,detail,showpic,price from product
  where cateid=? and status=1 order by proid desc
  limit 8 offset ${(req.query.page - 1) * 8}`
  db.query(sqlStr, cateid, (err, result) => {
    if (err) {
      return res.sendMessage(err)
    } else {
      if (result.length > 0) {
        result.count = count
        res.send({
          status: 0,
          message: '获取时尚衣服成功',
          count: count,
          data: result,
        })
      } else res.sendMessage('获取时尚衣服失败')
    }
  })
}

exports.addProduct = (req, res) => {
  const data = req.body
  // return res.send(data)
  const sqlStr = `insert into product (proname,detail,price,cateid,platid,showpic) values(?,?,?,?,?,?)`
  db.query(
    sqlStr,
    [
      data.proname,
      data.detail,
      data.price,
      data.cateid,
      data.platid,
      data.showpic,
    ],
    (err, result) => {
      if (err) return res.sendMessage(err)
      else {
        if (result.affectedRows == 1) return res.sendMessage('添加商品成功', 0)
        return res.sendMessage('添加商品失败')
      }
    }
  )
}
