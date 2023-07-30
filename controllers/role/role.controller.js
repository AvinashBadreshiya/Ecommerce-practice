const DB = require("../../models");
const messages = require("../../json/message.json");
const apiResponse = require("../../utils/api.response");
const Joi = require("joi")
const validator = require("../../middleware/validator")

const createRole = {

  validate: validator({
    body: Joi.object({
      name: Joi.string().required()
    })
  }),

  handler: async (req, res) => {
    try {
      const getRole = await DB.ROLE.findOne({ name: req.body.name })
      if (getRole) return apiResponse.BAD_REQUEST({ res, message: messages.DUPLICATE_KEY })
      const role = await DB.ROLE.create(req.body);
      return apiResponse.OK({ res, message: messages.SUCCESS, data: role });
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message });
    }
  }

}

const getRole = {

  handler: async (req, res) => {
    try {
      const role = await DB.ROLE.find();
      return apiResponse.OK({ res, message: messages.SUCCESS, data: role });
    } catch (error) {
      return apiResponse.CATCH_ERROR({ res, message: error.message });
    }
  }

}

module.exports = { createRole, getRole }
