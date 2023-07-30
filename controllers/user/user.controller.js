const messages = require("../../json/message.json");
const apiResponse = require("../../utils/api.response");
const DB = require("../../models");
const helper = require("../../utils/utils");
const { USER_TYPE: { SUPERADMIN } } = require("../../json/enums.json");
const validator = require("../../middleware/validator")
const Joi = require("joi")

const signUp = {

  validate: validator({
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).message("Password must be at least 8 characters long.").required(),
      roleId: Joi.string().required(),
      phone: Joi.number().required()
    })
  }),

  handler: async (req, res) => {
    try {
      const getUser = await DB.USER.findOne({ $or: [{ email: req.body.email }, { phone: req.body.phone }] })
      if (getUser) return apiResponse.BAD_REQUEST({ res, message: messages.USER_EXISTS })

      const roleId = await DB.ROLE.findById(req.body.roleId)
      if (!roleId) return apiResponse.BAD_REQUEST({ res, message: messages.INVALID_ROLE })

      const newUser = await DB.USER.create(req.body)
      return apiResponse.OK({ res, message: messages.SIGNUP, data: newUser })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const signIn = {

  validate: validator({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }),

  handler: async (req, res) => {
    try {
      const getUser = await DB.USER.findOne({ email: req.body.email }).select("password").populate("roleId", "name")
      if (!getUser) return apiResponse.BAD_REQUEST({ res, message: messages.USER_NOT_FOUND })
      
      const matchPassword = await helper.comparePassword({ password: req.body.password, hash: getUser.password })
      if (!matchPassword) return apiResponse.BAD_REQUEST({ res, message: messages.INVALID_PASSWORD })

      const token = await helper.generateToken({ data: { _id: getUser._id, role: getUser.roleId.name, email: getUser.name } });
      return apiResponse.OK({ res, message: messages.SIGNIN, data: token })
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message })
    }
  }

}

const createSuperadmin = {

  handler: async () => {
    try {
      const superAdmin = await DB.USER.findOne({ email: process.env.SUPERADMIN_EMAIL })
      if (superAdmin) {
        console.log("Super admin is available")
      } else {
        let getRole = await DB.ROLE.findOne({ name: SUPERADMIN })
        if (!getRole) {
          getRole = await DB.ROLE.create({ name: SUPERADMIN })
        }
        await DB.USER.create({
          name: process.env.SUPERADMIN_NAME,
          email: process.env.SUPERADMIN_EMAIL,
          phone: process.env.SUPERADMIN_PHONE,
          password: process.env.SUPERADMIN_PASSWORD,
          roleId: getRole._id
        })
        console.log("Super admin created")
      }
    } catch (error) {
      console.log("error", error.message)
    }
  }

}

module.exports = { createSuperadmin, signUp, signIn }
