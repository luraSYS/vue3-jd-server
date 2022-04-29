const express = require('express')
const router = express.Router()
const router_handle = require('../router_handle/product')

// 获取精品推商品信息
router.get('/boutique', router_handle.getBoutique)

// 获取热门商品信息
router.get('/hot', router_handle.getHot)

// 获取活动商品信息
router.get('/promotion', router_handle.getPromotion)

// 获取数码产品类商品
router.get('/digital', router_handle.getDigital)
// 获取精品图书类商品
router.get('/books', router_handle.getBooks)
// 获取时尚衣服类商品
router.get('/cloths', router_handle.getCloths)
// 获取美食甜品类商品
router.get('/food', router_handle.getFood)
// 获取家用电器类商品
router.get('/device', router_handle.getDevice)
// 获取商品详情信息
router.get('/detail', router_handle.getDetail)

// 获取推荐商品
router.get('/recommend', router_handle.getRecommend)

// 添加商品进数据库
router.post('/addproduct', router_handle.addProduct)
module.exports = router
