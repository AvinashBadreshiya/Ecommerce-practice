const messages = require("../../json/message.json");
const apiResponse = require("../../utils/api.response");
const DB = require("../../models");
const validator = require("../../middleware/validator")
const { PRODUCT_STATUS: { APPROVE } } = require("../../json/enums.json")
const Joi = require("joi")

const addToCart = {

  validate: validator({
    body: Joi.object({
      cart: Joi.object({
        productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid Id").required()
      }),
    })
  }),

  handler: async (req, res) => {
    try {
      const getProduct = await DB.PRODUCT.findOne({ _id: req.body.cart.productId, status: APPROVE })
      if (!getProduct) return apiResponse.BAD_REQUEST({ res, message: messages.PRODUCT_NOT_FOUND })

      req.body.userId = req.user._id
      req.body.cart.totalPrice = getProduct.price
      req.body.cart.vendorId = getProduct.vendorId
      
      let newCart
      const getCart = await DB.CART.findOne({ userId: req.body.userId })
      if (getCart) {
        newCart = await DB.CART.findOneAndUpdate(
          { userId: req.body.userId },
          { $push: { cart: req.body.cart } },
          { new: true }
        )
      } else {
        newCart = await DB.CART.create(req.body)
      }

      return apiResponse.OK({ res, message: messages.PRODUCT_ADDED_TO_CART, data: newCart })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const getCart = {

  handler: async (req, res) => {
    try {
      const getUserCart = await DB.CART.aggregate([
        {
          $match: {
            userId: req.user._id,
          },
        },
        {
          $unwind: {
            path: "$cart",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "product",
            localField: "cart.productId",
            foreignField: "_id",
            as: "cart.productId",
          },
        },
        {
          $unwind: {
            path: "$cart.productId",
            preserveNullAndEmptyArrays: true,
          },
        }, {
          $sort: {
            createdAt: -1
          }
        }
      ])
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
      if (req.query?.emptyCart && req.query.emptyCart === "true") {
        await DB.CART.deleteMany({ userId: req.user._id })
        return apiResponse.OK({ res, message: messages.CART_REMOVE });
      } else {
        if (!await DB.CART.findOne({ 'cart._id': req.query?.cartId }, { 'cart.$': 1 })) return apiResponse.BAD_REQUEST({ res, message: messages.CART_NOT_FOUND });
        await DB.CART.findOneAndDelete({ "cart._id": req.query?.cartId })
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
      cartId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid cartID").required(),
      isIncrement: Joi.string().valid("true", "false").required()
    })
  }),

  handler: async (req, res) => {
    try {
      const getUserCart = await DB.CART.findOne({ 'cart._id': req.query.cartId }, { 'cart.$': 1 })
      if (!getUserCart) return apiResponse.BAD_REQUEST({ res, message: messages.CART_NOT_FOUND })
      const cartProduct = getUserCart.cart[0]
      const getProduct = await DB.PRODUCT.findById(cartProduct.productId)
      if (!getProduct) return apiResponse.BAD_REQUEST({ res, message: messages.PRODUCT_NOT_FOUND })

      if (req.query.isIncrement === "true") {
        if (getProduct.stock < parseInt(cartProduct.quantity + 1)) return apiResponse.BAD_REQUEST({ res, message: messages.INSUFFICIENT_QUANTITY })
        await DB.CART.findOneAndUpdate(
          { "cart._id": req.query.cartId },
          { $set: { "cart.$.totalPrice": parseFloat((cartProduct.quantity + 1) * getProduct.price) }, $inc: { "cart.$.quantity": 1 } }
        )
        return apiResponse.OK({ res, message: messages.CART_UPDATED })
      } else if (req.query.isIncrement === "false") {
        if (parseInt(cartProduct.quantity - 1) === 0) {
          const deleteProduct = await DB.CART.findOneAndUpdate(
            { "cart._id": req.query.cartId },
            { $pull: { cart: { _id: req.query.cartId } } },
            { new: true }
          )
          if (deleteProduct.cart.length > 0) return apiResponse.OK({ res, message: messages.CART_PRODUCT_DELETED })
          await DB.CART.findOneAndDelete({ userId: req.user._id })
          return apiResponse.OK({ res, message: messages.CART_REMOVE })
        } else if (parseInt(cartProduct.quantity - 1) > 0) {
          await DB.CART.findOneAndUpdate(
            { "cart._id": req.query.cartId },
            { $set: { "cart.$.totalPrice": parseFloat((cartProduct.quantity - 1) * getProduct.price) }, $inc: { "cart.$.quantity": -1 } }
          )
          return apiResponse.OK({ res, message: messages.CART_UPDATED })
        }
      }
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

module.exports = { addToCart, getCart, deleteCart, updateCart }
