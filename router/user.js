const express = require('express')
const router = express.Router()
const router_handle = require('../router_handle/user')

// 挂载用户登录注册路由
// 用户注册
router.post('/register', router_handle.userRegister)
// 用户登录
router.post('/login', router_handle.userLogin)
// 用户手机号登录
router.post('/logbypho', router_handle.userLogin2)
// 将密码改为加密格式
router.post('/alter', router_handle.alter)

module.exports = router
