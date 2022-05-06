const express = require('express')
const router = express.Router()
const router_handle = require('../router_handle/userinfo')

// 用于挂载用户信息相关路由
router.get('/user', router_handle.getUser)
router.get('/logout', router_handle.userLogout)

// 修改用户相关信息
// 1.头像
router.post('/mod/profile', router_handle.userModProfile)
// 2.用户名
router.get('/mod/name', router_handle.userModName)
// 3.电话号码
router.get('/mod/tel', router_handle.userModTel)
router.post('/mod/info', router_handle.userModInfo)
// 4.密码(检查+修改与重置)
router.post('/checkpsd', router_handle.checkUserPsd)
router.post('/mod/psd', router_handle.userModPassword)
router.post('/reset/psd', router_handle.userResetPassword)
// 5.账户
router.post('/mod/account', router_handle.userModAccount)

module.exports = router
