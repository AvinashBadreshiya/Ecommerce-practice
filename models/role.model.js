const { Schema, model } = require("mongoose");

const { USER_TYPE } = require("../json/enums.json");

let roleSchema = new Schema(
  {
    name: {
      type: String,
      enum: { values: [...Object.values(USER_TYPE)], message: "Invalid role" },
      unique: true,
      message: "please enter valid role name or role already exist",
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

let roleModel = model("role", roleSchema, "role");

module.exports = roleModel;
