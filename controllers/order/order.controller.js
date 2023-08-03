const messages = require("../../json/message.json");
const apiResponse = require("../../utils/api.response");
const DB = require("../../models");
const validator = require("../../middleware/validator")
const { v4: uuid } = require("uuid")
const Joi = require("joi")

const createOrder = {

  validate: validator({
    body: Joi.object({
      cartId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid Id").required(),
      address: Joi.string().required(),
      pincode: Joi.number().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
    })
  }),

  handler: async (req, res) => {
    try {
      const getCart = await DB.CART.findById(req.body.cartId)
      if (!getCart) return apiResponse.BAD_REQUEST({ res, message: messages.CART_NOT_FOUND })

      for (let i = 0; i < getCart.cart.length; i++) {
        req.body.orderId = uuid(),
          req.body.userId = req.user._id,
          req.body.vendorId = getCart.cart[i].vendorId,
          req.body.productId = getCart.cart[i].productId,
          req.body.quantity = getCart.cart[i].quantity,
          req.body.totalPrice = getCart.cart[i].totalPrice
        await DB.ORDER.create(req.body)
      }
      await DB.CART.findByIdAndDelete(req.body.cartId)
      return apiResponse.OK({ res, message: messages.ORDER_SUCCESS })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const getOrderForUser = {

  handler: async (req, res) => {
    try {
      const page = parseInt(req.query?.page) || 1
      const limit = parseInt(req.query?.limit) || 10
      const getUserOrder = await (await DB.ORDER.find({ userId: req.user._id })).limit(limit).skip(limit * page - limit).sort({ createdAt: -1 }).populate("productId")
      return apiResponse.OK({ res, message: messages.SUCCESS, data: getUserOrder })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const getOrderForVendor = {

  validate: validator({
    query: Joi.object({
      orderId: Joi.string(),
      search: Joi.string(),
      page: Joi.string(),
      limit: Joi.string()
    })
  }),

  handler: async (req, res) => {
    try {
      const page = parseInt(req.query?.page) || 1
      const limit = parseInt(req.query?.limit) || 10

      let criteria = { vendorId: req.user._id }
      if (req.query?.orderId) criteria = { ...criteria, orderId: req.query.orderId }

      let search = {}
      if (req.query?.search) search = {
        $or: [
          { "productId.company": { $regex: req.query.search, $options: "i" } },
          { city: { $regex: req.query.search, $options: "i" } },
          { state: { $regex: req.query.search, $options: "i" } },
          { status: { $regex: req.query.search, $options: "i" } }
        ]
      }

      const getVendorOrder = await DB.ORDER.aggregate([
        {
          $match: criteria
        },
        {
          $lookup: {
            from: "product",
            localField: "productId",
            foreignField: "_id",
            as: "productId",
          },
        },
        {
          $unwind: {
            path: "$productId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        {
          $unwind: {
            path: "$userId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: search,
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $facet: {
            count: [
              {
                $count: "_doc",
              },
            ],
            data: [
              {
                $skip: limit * page - limit,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$count",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            data: 1,
            count: "$count._doc",
          },
        },
      ])
      return apiResponse.OK({ res, message: messages.SUCCESS, data: getVendorOrder })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const getOrderForSuperAdmin = {

  validate: validator({
    query: Joi.object({
      orderId: Joi.string(),
      search: Joi.string(),
      page: Joi.string(),
      limit: Joi.string()
    })
  }),

  handler: async (req, res) => {
    try {
      const page = parseInt(req.query?.page) || 1
      const limit = parseInt(req.query?.limit) || 10

      let criteria = {}
      if (req.query?.orderId) criteria.orderId = req.query.orderId

      let search = {}
      if (req.query?.search) search = {
        $or: [
          { "productId.company": { $regex: req.query.search, $options: "i" } },
          { city: { $regex: req.query.search, $options: "i" } },
          { state: { $regex: req.query.search, $options: "i" } },
          { status: { $regex: req.query.search, $options: "i" } }
        ]
      }

      const getVendorOrder = await DB.ORDER.aggregate([
        {
          $match: criteria
        },
        {
          $lookup: {
            from: "product",
            localField: "productId",
            foreignField: "_id",
            as: "productId",
          },
        },
        {
          $unwind: {
            path: "$productId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        {
          $unwind: {
            path: "$userId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: search,
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $facet: {
            count: [
              {
                $count: "_doc",
              },
            ],
            data: [
              {
                $skip: limit * page - limit,
              },
              {
                $limit: limit,
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$count",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            data: 1,
            count: "$count._doc",
          },
        },
      ])
      return apiResponse.OK({ res, message: messages.SUCCESS, data: getVendorOrder })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const deleteCart = {
  validate: validator({
    query: Joi.object({
      cartId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid Id").when("emptyCart", { is: "true", then: Joi.forbidden(), otherwise: Joi.required() }),
      emptyCart: Joi.string().valid("true")
    })
  }),

  handler: async (req, res) => {
    try {
      console.log(req.user._id);
      if (req.query?.emptyCart && req.query.emptyCart === "true") {
        await DB.CART.deleteMany({ userId: req.user._id })
        return apiResponse.OK({ res, message: messages.CART_REMOVE });
      } else {
        if (!await DB.CART.findById(req.query?.cartId)) return apiResponse.BAD_REQUEST({ res, message: messages.CART_NOT_FOUND });
        await DB.CART.findByIdAndDelete(req.query?.cartId)
        return apiResponse.OK({ res, message: messages.CART_PRODUCT_DELETED });
      }
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }
}

const updateCart = {

  validate: validator({
    query: Joi.object({
      cartId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid ID").required(),
      isIncrement: Joi.string().valid("true", "false").required()
    })
  }),

  handler: async (req, res) => {
    try {
      const getUserCart = await DB.CART.findById(req.query.cartId)
      if (!getUserCart) return apiResponse.BAD_REQUEST({ res, message: messages.CART_NOT_FOUND })
      const getProduct = await DB.PRODUCT.findById(getUserCart.productId)
      if (!getProduct) return apiResponse.BAD_REQUEST({ res, message: messages.PRODUCT_NOT_FOUND })

      if (req.query.isIncrement === "true") {
        if (getProduct.stock < parseInt(getUserCart.quantity + 1)) return apiResponse.BAD_REQUEST({ res, message: messages.INSUFFICIENT_QUANTITY })
        await DB.CART.findByIdAndUpdate(req.query.cartId, { $inc: { quantity: 1 } })
        return apiResponse.OK({ res, message: messages.CART_UPDATED })
      } else if (req.query.isIncrement === "false") {
        if (parseInt(getUserCart.quantity - 1) === 0) {
          await DB.CART.findByIdAndDelete(req.query.cartId)
          return apiResponse.OK({ res, message: messages.CART_PRODUCT_DELETED })
        } else if (parseInt(getUserCart.quantity - 1) > 0) {
          await DB.CART.findByIdAndUpdate(req.query.cartId, { $inc: { quantity: -1 } })
          return apiResponse.OK({ res, message: messages.CART_UPDATED })
        }
      }
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

module.exports = { createOrder, getOrderForUser, getOrderForVendor, getOrderForSuperAdmin, deleteCart, updateCart }
