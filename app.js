const express = require('express')
const app = express()
const userRouter = require('./router/user')
const userInfoRouter = require('./router/userinfo')
const productRouter = require('./router/product')
const shoppingcarRouter = require('./router/shoppingcar')
const orderRouter = require('./router/order')
const addressRouter = require('./router/address')
const expressJWT = require('express-jwt')
const config = require('./config/config')
const cors = require('cors')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
// 挂载jwt身份认证
app.use(
  expressJWT({
    secret: config.secretKey,
    algorithms: ['HS256'],
    credentialsRequired: true,
  }).unless({ path: [/(^\/api)|(^\/product)/] })
)
app.use((req, res, next) => {
  res.sendMessage = function (err, status = 1, data = null) {
    res.send({
      status,
      message: err instanceof Error ? err.message : err,
      data,
    })
  }
  next()
})
app.use('/api', userRouter)
app.use('/mine', userInfoRouter)
app.use('/product', productRouter)
app.use('/car', shoppingcarRouter)
app.use('/order', orderRouter)
app.use('/address', addressRouter)

// 挂载错误中间件预防程序崩溃
app.use((err, req, res, next) => {
  // 身份认证失败
  if (err.name === 'UnauthorizedError')
    return res.send({
      status: 1,
      message: '身份认证失败！',
    })
})

app.listen(process.env.PORT || 8080, () => {
  console.log('server open')
})
