const messages = require("../../json/message.json");
const apiResponse = require("../../utils/api.response");
const DB = require("../../models");
const { PRODUCT_STATUS: { APPROVE, REJECT } } = require("../../json/enums.json");
const validator = require("../../middleware/validator")
const Joi = require("joi")

const addProduct = {

  validate: validator({
    body: Joi.object({
      company: Joi.string().required(),
      model: Joi.string().required(),
      price: Joi.number().min(4999).required(),
      type: Joi.string().required(),
      ram: Joi.string().required(),
      rom: Joi.string().required(),
      color: Joi.string().required(),
      chargerType: Joi.string().required(),
      chargerWatt: Joi.number().required(),
      frontCamera: Joi.string().required(),
      rearCamera: Joi.string().required(),
      stock: Joi.number().min(1).required()
    })
  }),

  handler: async (req, res) => {
    try {
      if (!await DB.USER.findById(req.user._id)) return apiResponse.BAD_REQUEST({ res, message: messages.USER_NOT_FOUND })

      req.body.vendorId = req.user._id
      const newProduct = await DB.PRODUCT.create(req.body)
      return apiResponse.OK({ res, message: messages.PRODUCT_ADDED, data: newProduct })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const getProductForVendor = {

  validate: validator({
    query: Joi.object({
      _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid ID"),
      status: Joi.string(),
      company: Joi.string(),
      model: Joi.string(),
      type: Joi.string(),
      page: Joi.string(),
      limit: Joi.string(),
      price: Joi.string().valid("hightolow", "lowtohigh")
    })
  }),

  handler: async (req, res) => {
    try {
      const page = parseInt(req?.query?.page) || 1
      const limit = parseInt(req?.query?.limit) || 10

      let criteria = { vendorId: req.user._id }
      if (req?.query?._id) criteria._id = req.query._id
      if (req?.query?.status) criteria = { ...criteria, status: req.query.status }
      if (req?.query?.company) criteria = { ...criteria, company: { $regex: req.query.company, $options: "i" } }
      if (req?.query?.model) criteria = { ...criteria, model: { $regex: req.query.model, $options: "i" } }
      if (req?.query?.type) criteria = { ...criteria, type: { $regex: req.query.type, $options: "i" } }
      const sort = (req?.query?.price === "hightolow") ? { price: -1 } : { price: 1 }

      const getProduct = await DB.PRODUCT.find(criteria).limit(limit).skip(limit * page - limit).sort(sort)
      return apiResponse.OK({ res, message: messages.SUCCESS, data: getProduct })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const getProductForUser = {
  validate: validator({
    query: Joi.object({
      company: Joi.string(),
      model: Joi.string(),
      type: Joi.string(),
      page: Joi.string(),
      limit: Joi.string(),
      price: Joi.string().valid("hightolow", "lowtohigh")
    })
  }),

  handler: async (req, res) => {
    try {

      const page = parseInt(req?.query?.page) || 1
      const limit = parseInt(req?.query?.limit) || 10

      let criteria = { status: APPROVE, stock: { $gt: 0 } }
      if (req?.query?.company) criteria = { ...criteria, company: { $regex: req.query.company, $options: "i" } }
      if (req?.query?.model) criteria = { ...criteria, model: { $regex: req.query.model, $options: "i" } }
      if (req?.query?.type) criteria = { ...criteria, type: { $regex: req.query.type, $options: "i" } }

      const sort = (req?.query?.price === "hightolow") ? { price: -1 } : { price: 1 }

      const getProduct = await DB.PRODUCT.find(criteria).limit(limit).skip(limit * page - limit).sort(sort)
      return apiResponse.OK({ res, message: messages.SUCCESS, data: getProduct })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }
}

const getProductForSuperAdmin = {

  validate: validator({
    query: Joi.object({
      _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid ID"),
      status: Joi.string(),
      company: Joi.string(),
      model: Joi.string(),
      type: Joi.string(),
      page: Joi.string(),
      limit: Joi.string(),
      price: Joi.string().valid("hightolow", "lowtohigh")
    })
  }),

  handler: async (req, res) => {
    try {
      const page = parseInt(req?.query?.page) || 1
      const limit = parseInt(req?.query?.limit) || 10

      let criteria = {}
      if (req?.query?._id) criteria._id = req.query._id
      if (req?.query?.status) criteria = { ...criteria, status: req.query.status }
      if (req?.query?.company) criteria = { ...criteria, company: { $regex: req.query.company, $options: "i" } }
      if (req?.query?.model) criteria = { ...criteria, model: { $regex: req.query.model, $options: "i" } }
      if (req?.query?.type) criteria = { ...criteria, type: { $regex: req.query.type, $options: "i" } }
      const sort = (req?.query?.price === "hightolow") ? { price: -1 } : { price: 1 }

      const getProduct = await DB.PRODUCT.find(criteria).limit(limit).skip(limit * page - limit).sort(sort)
      return apiResponse.OK({ res, message: messages.SUCCESS, data: getProduct })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const deleteProduct = {

  validate: validator({
    query: Joi.object({
      _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid ID").required()
    })
  }),

  handler: async (req, res) => {
    try {
      if (!await DB.PRODUCT.findById(req.query._id)) return apiResponse.BAD_REQUEST({ res, message: messages.PRODUCT_NOT_FOUND })
      await DB.PRODUCT.findByIdAndDelete(req.query._id)
      return apiResponse.OK({ res, message: messages.PRODUCT_DELETED })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const approveProduct = {

  validate: validator({
    query: Joi.object({
      _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid ID").required()
    }),

    body: Joi.object({
      status: Joi.string().valid(APPROVE, REJECT).required()
    })
  }),

  handler: async (req, res) => {
    try {
      if (!await DB.PRODUCT.findById(req.query._id)) return apiResponse.BAD_REQUEST({ res, message: messages.PRODUCT_NOT_FOUND })
      await DB.PRODUCT.findByIdAndUpdate(req.query._id, req.body)
      return apiResponse.OK({ res, message: messages.PRODUCT_STATUS })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const updateProduct = {

  validate: validator({
    query: Joi.object({
      _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("Invalid ID").required()
    }),

    body: Joi.object({
      company: Joi.string(),
      model: Joi.string(),
      price: Joi.number().min(1),
      type: Joi.string(),
      ram: Joi.string(),
      rom: Joi.string(),
      color: Joi.string(),
      chargerType: Joi.string(),
      chargerWatt: Joi.number(),
      frontCamera: Joi.string(),
      rearCamera: Joi.string(),
      stock: Joi.number().min(1)
    })
  }),

  handler: async (req, res) => {
    try {
      if (!await DB.PRODUCT.findById(req.query._id)) return apiResponse.BAD_REQUEST({ res, message: messages.PRODUCT_NOT_FOUND })
      await DB.PRODUCT.findByIdAndUpdate(req.query._id, req.body)
      return apiResponse.OK({ res, message: messages.PRODUCT_UPDATED })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

module.exports = { addProduct, getProductForVendor, getProductForUser, getProductForSuperAdmin, deleteProduct, approveProduct, updateProduct }
