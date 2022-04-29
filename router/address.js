const express = require('express')
const router = express.Router()
const router_handle = require('../router_handle/address')

// 获取收货地址
router.post('/getaddress', router_handle.getAddress)

// 添加收货地址
router.post('/add', router_handle.addAddress)

// 删除收货地址
router.post('/remove', router_handle.RemoveAddress)

// 设为默认收货地址
router.post('/setdef', router_handle.setDefault)

// 获取默认收货地址
router.post('/getdef', router_handle.getDefault)

// 修改收货地址
router.post('/mod', router_handle.modAddress)
module.exports = router
