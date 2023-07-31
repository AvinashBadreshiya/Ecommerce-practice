const messages = require("../../json/message.json");
const apiResponse = require("../../utils/api.response");
const DB = require("../../models");
const validator = require("../../middleware/validator")
const { v4: uuid } = require("uuid")
const Joi = require("joi")

const createOrder = {

  validate: validator({
    body: Joi.object({
      cartId: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid Id").required()).required(),
      address: Joi.string().required(),
      pincode: Joi.number().length == 6,
      city: Joi.string().required(),
      state: Joi.string().required(),
    })
  }),

  handler: async (req, res) => {
    try {

      for ( i = 0; i < req.body.cartId.length; i++) {
        const element = array[i];
        const getCart = await DB.CART.findById(req.body.cartId)
        if (!getCart) return apiResponse.BAD_REQUEST({ res, message: messages.CART_NOT_FOUND })
        
      }

      req.body.orderId = uuid()
      req.body.userId = req.user._id
      req.body.vendorId = getCart.vendorId
      req.body.productId = getCart.productId
      req.body.quantity = getCart.quantity
      req.body.totalPrice = getCart.totalPrice
      const newOrder = await DB.ORDER.create(req.body)
      return apiResponse.OK({ res, message: messages.PRODUCT_ADDED_TO_CART, data: newOrder })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const getCart = {

  handler: async (req, res) => {
    try {
      const getUserCart = await DB.CART.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate("productId")
      return apiResponse.OK({ res, message: messages.SUCCESS, data: getUserCart })
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

module.exports = { createOrder, getCart, deleteCart, updateCart }
