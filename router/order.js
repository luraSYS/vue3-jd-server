const express = require("express");
const router = express.Router();
const router_handle = require("../router_handle/order");

// 获取订单号
router.post("/getorderid", router_handle.getOrderId);
// 获取订单详情表
router.post("/getorders", router_handle.getOrder);

// 添加至订单详情表(生成订单详情表)
router.post("/additem", router_handle.addToOrderItem);

// 添加至订单表(生成订单表)
router.post("/add", router_handle.addToOrder);
module.exports = router;
