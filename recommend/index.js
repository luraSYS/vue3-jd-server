const _ = require('lodash')
// 基于用户推荐
const RecommendUserService = class RecommendUserService {
  /**
   * 构造方法
   * @param {*倒查表所有数据组成的数组} data
   * @param {*用户ID} userId
   * @param {*相似度最高的前n个} n
   */
  constructor(data, userId, n) {
    this.data = data
    this.userId = userId
    this.n = n
    // 相似度的分子
    this.top = undefined
    // 相似度的分母
    this.bottom = undefined
    // 记录除用户自身外，其他所有用户的ID
    this.userArray = []
    // 作为中间值，记录当前正在进行的其他用户的商品列表
    this.userGoodsTemp = []
    // 记录用户最终相似度列表
    this.similarityList = []
    // 记录用户相似度前n个用户中所有购买的商品与本用户不重复的商品
    this.targetGoods = []
    // 记录用户对筛选出的各商品感兴趣程度
    this.interestedGrade = []
    // 记录最后的返回结果
    this.result = []
  }
  /**
   * 入口
   */
  start() {
    // 计算相似度，得出本用户和其他所有用户的相似度分数
    this.getUserArray()
    this.similarityList.sort((a, b) => {
      return b.grade - a.grade
    })
    // 计算目标商品
    this.getTargetGoods()
    // 此时目标商品已存在this.targetGoods中, 然后去重
    this.targetGoods = [...new Set(this.targetGoods)]

    // 计算用户对每个商品的感兴趣程度
    for (let goodsId of this.targetGoods.values()) {
      this.getInterestedGrade(goodsId)
    }
    // 计算最终商品列表并逆序排序
    this.getFinalResult()
    return this.result
  }
  /**
   * 计算最终商品列表并逆序排序
   */
  getFinalResult() {
    this.interestedGrade.sort((a, b) => {
      return b.grade - a.grade
    })
    for (let obj of this.interestedGrade.values()) {
      this.result.push(obj.goodsId)
    }
  }
  /**
   * 计算用户对该商品的感兴趣程度
   * @param {*商品ID} goodsId
   */
  getInterestedGrade(goodsId) {
    // 筛选出对商品goodsId用过行为的用户
    let array = new Set()
    for (let obj of this.data.values()) {
      if (obj.goodsId === goodsId) {
        array.add(obj.userId)
      }
    }
    const users = [...array]
    // 计算感兴趣程度
    let grade = 0
    for (let userId of users.values()) {
      for (let i = 0; i < this.n; i++) {
        if (userId === this.similarityList[i].userId) {
          const res = this.getUserSimilarity(
            userId,
            this.similarityList[i].userId
          )
          grade += res
        }
      }
    }
    // 添加到最终结果
    this.interestedGrade.push({
      goodsId: goodsId,
      grade: grade,
    })
  }
  /**
   * 获取目标商品数组
   */
  getTargetGoods() {
    // this.n > this.similarityList.length ? this.n = this.similarityList.l : this.n = this.n
    // 截至目前，以获取用户相似度的逆序排序数组，以下为获取前n个相似用户购买的所有商品中本用户没买过的
    for (let index = 0; index < this.n; index++) {
      const element = this.similarityList[index]
      _.filter(this.data, (obj) => {
        if (obj.userId == element.userId) {
          this.targetGoods.push(obj.goodsId)
        }
        return obj.userId == element.userId
      })
    }
    // 去掉自身的商品，得到最终目标商品数组
    this.duplicateRemovalGoods()
  }
  /**
   * 去掉自身的商品，得到最终目标商品数组
   */
  duplicateRemovalGoods() {
    // 获取当前用户买过的商品
    const userGoods = _.filter(this.data, (obj) => {
      return obj.userId == this.userId
    })
    // 删除本用户买过的商品
    for (let obj of userGoods.values()) {
      if (this.targetGoods.includes(obj.goodsId)) {
        this.targetGoods.splice(this.targetGoods.indexOf(obj.goodsId), 1)
      }
    }
  }
  /**
   * 获取除用户自身外其他所有的用户ID
   */
  getUserArray() {
    const data = _.filter(this.data, (obj) => {
      return obj.userId !== this.userId
    })
    // 获取其他所有用户的ID
    let arrayTemp = []
    for (let index in data) {
      arrayTemp.push(data[index].userId)
    }
    this.userArray = [...new Set(arrayTemp)]
    // 避免this.n超出边界
    this.n > this.userArray.length
      ? (this.n = this.userArray.length)
      : (this.n = this.n)
    // 遍历计算与每个用户的相似度
    for (let index in this.userArray) {
      this.getUserSimilarity(this.userId, this.userArray[index])
    }
  }
  /**
   * 计算两个用户的相似度
   * @param {*用户ID} userId
   * @param {*另一个用户ID} otherUserId
   */
  getUserSimilarity(userId, otherUserId) {
    const userSelfGoods = _.filter(this.data, (obj) => {
      return userId == obj.userId
    })
    this.filterUserGoods(otherUserId)
    // 计算相似度的分母
    this.bottom = Math.sqrt(userSelfGoods.length * this.userGoodsTemp.length)
    // 记录商品相似的个数
    let count = 0
    userSelfGoods.forEach((ele) => {
      for (let index in this.userGoodsTemp) {
        if (ele.goodsId == this.userGoodsTemp[index].goodsId) {
          // 惩罚热门商品,计算惩罚参数
          const log = this.filterGoodsById(ele.goodsId)
          // 可在此处添加weight权重，log * weight
          count += log
        }
      }
    })
    this.top = count
    const obj = {
      userId: otherUserId,
      grade: this.top / this.bottom,
    }
    this.similarityList.push(obj)
    return obj.grade
  }
  /**
   * 过滤出用户otherUserId的商品列表
   * @param {用户ID} otherUserId
   */
  filterUserGoods(otherUserId) {
    this.userGoodsTemp = _.filter(this.data, (obj) => {
      return obj.userId == otherUserId
    })
  }
  /**
   * 过滤出商品goodsId的商品列表
   * @param {商品ID} goodsId
   */
  filterGoodsById(goodsId) {
    const goods = _.filter(this.data, (obj) => {
      return obj.goodsId == goodsId
    })
    return 1 / Math.log(1 + goods.length)
  }
}
// 基于物品推荐
const RecommendGoodsService = class RecommendGoodsService {
  /**
   * 构造方法
   * @param {*倒查表所有数据组成的数组} data
   * @param {*商品ID} goodsId
   * @param {*用户ID} userId
   * @param {*相似度最高的前k个} k
   */
  constructor(data, userId, k, goodsId) {
    this.data = data
    this.goodsId = goodsId
    this.userId = userId
    // 筛选前k个商品······用于模块一······
    this.k = k
    // 保存待计算商品列表······用于模块一······
    this.goodsList = []
    // 保存当前商品的购买人列表······用于模块一······
    this.users = []
    // 保存当前商品相似度列表······用于模块一······
    this.simpleList = []
    // 开启第二子系统-模块二
    // 保存当前人喜爱商品列表
    this.userPerferList = []
    // 保存当前人没买过的商品列表
    this.goodsMayPerferList = []
    // 保存推荐结果并排序
    this.resultRank = []
    // 最终结果
    this.result = []
  }

  /**
   * 入口
   */
  start() {
    // 获取待计算数据
    this.getInitialData()
    // 开始计算用户对未买过的商品感兴趣程度
    for (let goodsId of this.goodsMayPerferList.values()) {
      const res = this.getUserInterest(goodsId)
      this.resultRank.push(res)
    }
    // 逆序排序
    this.resultRank.sort((a, b) => {
      return b.grade - a.grade
    })
    // 获取最终结果
    this.result = this.resultRank.reduce((array, obj) => {
      array.push(obj.goodsId)
      return array
    }, [])
    return this.result
  }
  /**
   * 计算用户对该商品的感兴趣程度
   * @param {*商品ID} goodsId
   */
  getUserInterest(goodsId) {
    // 获取goodsId相似的商品列表
    const simple = this.getGoodsGrade(false, goodsId)
    let grade = 0
    for (let [index, obj] of simple.entries()) {
      if (this.userPerferList.includes(obj.goodsId) && index < this.k) {
        grade += obj.grade
      }
    }
    return { goodsId, grade }
  }
  /**
   * 获取待计算数据
   */
  getInitialData() {
    // 获取当前人的喜爱记录
    this.userPerferList = this.data.reduce((array, obj) => {
      if (obj.userId === this.userId && !array.includes(obj.goodsId)) {
        array.push(obj.goodsId)
      }
      return array
    }, [])
    // 获取当前用户没买过的商品列表
    this.goodsMayPerferList = this.data.reduce((array, obj) => {
      if (
        !array.includes(obj.goodsId) &&
        !this.userPerferList.includes(obj.goodsId)
      ) {
        array.push(obj.goodsId)
      }
      return array
    }, [])
  }
  /**
   * 计算与商品goodsId相似的前k个商品列表,······模块一······
   * @param {*是否去掉自身相关的商品} isDelSelf
   * @param {*商品ID} goodsId
   */
  getGoodsGrade(isDelSelf, goodsId) {
    this.simpleList = []
    this.goodsId = goodsId
    // 获取待计算商品列表
    this.getGoodsList()
    // 获取当前商品的购买人列表
    this.users = this.getGoodsUserNum(this.goodsId)
    // 计算相似度
    for (let goodsId of this.goodsList.values()) {
      this.getGoodsSimple(goodsId)
    }
    // 根据相似度排序
    this.simpleList.sort((a, b) => {
      //倒序
      return b.grade - a.grade
    })
    // 是否排除掉自身
    if (isDelSelf) {
      this.getNotSelfGoods()
    }
    // 相似度归一化
    this.gradeNormalization()
    return this.simpleList
  }
  /**
   * 获取目标商品数组
   */
  getGoodsList() {
    //筛选除了本商品之外的商品数据
    const goodsArray = this.data.reduce((array, obj) => {
      if (obj.goodsId !== this.goodsId) {
        array.push(obj.goodsId)
      }
      return array
    }, [])
    //数组去重并解构
    const goods = [...new Set(goodsArray)]
    // 得到目标商品列表
    this.goodsList = goods
  }
  /**
   * 去掉已买过的商品，得到目标商品数组
   */
  getNotSelfGoods() {
    // 筛选当前用户买过的商品
    const userGoods = this.data.reduce((array, obj) => {
      if (obj.userId === this.userId) {
        array.push(obj.goodsId)
      }
      return array
    }, [])
    // 删除本用户买过的商品
    for (let [index, obj] of this.simpleList.entries()) {
      if (userGoods.includes(obj.goodsId)) {
        this.simpleList.splice(index, 1)
      }
    }
  }
  /**
   * 获取商品相似度列表
   * @param {商品ID} goodsId
   */
  getGoodsSimple(goodsId) {
    const users = this.getGoodsUserNum(goodsId)
    // 计算相似度的分母
    const bottom = Math.sqrt(this.users.length * users.length)
    let count = 0
    // 计算两个商品的共同用户数，得到相识度的分子
    for (let val of users.values()) {
      if (this.users.includes(val)) {
        // 惩罚活跃用户
        count += this.getSimpleElememt(val)
      }
    }
    // 保存结果对象，包括商品ID和相似度
    const res = {
      goodsId,
      grade: count / bottom,
    }
    this.simpleList.push(res)
  }
  /**
   * 提升算法，惩罚活跃用户，计算相似度分子
   * @param {*用户ID} userId
   */
  getSimpleElememt(userId) {
    // 找到用户买过的商品数量
    const goodsNum = this.data.reduce((array, obj) => {
      if (obj.userId === userId) {
        array.push(obj.goodsId)
      }
      return array
    }, [])
    const count = [...new Set(goodsNum)].length
    const element = 1 / Math.log(1 + count)
    return element
  }
  /**
   * 获取商品的购买人
   * @param {*商品ID} goodsId
   */
  getGoodsUserNum(goodsId) {
    //得到商品的购买人
    const users = this.data.reduce((array, obj) => {
      if (obj.goodsId === goodsId) {
        array.push(obj.userId)
      }
      return array
    }, [])
    return [...new Set(users)]
  }
  /**
   * 相似度归一化
   */
  gradeNormalization() {
    // 取最大值
    const max = this.simpleList[0].grade
    for (let index of this.simpleList.keys()) {
      this.simpleList[index].grade = this.simpleList[index].grade / max
    }
  }
}

module.exports = { RecommendUserService, RecommendGoodsService }
