const { hash } = require("bcryptjs");
const { Schema, model } = require("mongoose");
const message = require("../json/message.json");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "role",
      required: true,
    },
    address: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    autoCreate: true,
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  try {
    const user = this;
    console.log("user.isModified(password)", user.isModified("password"), "user.isNew", user.isNew);
    if (user.isModified("password") || user.isNew) {
      this.password = await hash(user.password, 10);
      next();
    } else {
      next();
    }
  } catch (error) {
    console.log(message.passwordEncryptError, error);
  }
});

let userModel = model("user", userSchema, "user");
module.exports = userModel;
