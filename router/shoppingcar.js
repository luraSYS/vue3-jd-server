const express = require('express')
const router = express.Router()
const router_handle = require('../router_handle/shoppingcar')

// 获取用户购物车信息
router.get('/shoppingcar', router_handle.getShoppingcar)

// 用户添加商品至购物车
router.post('/add', router_handle.addToCar)

// 删除购物车中的商品
router.post('/del', router_handle.delFromCar)
router.post('/delone', router_handle.delOneFromCar)

module.exports = router
