const { Schema, model } = require('mongoose');
const { ORDER_STATUS } = require("../json/enums.json");

const orderSchema = new Schema(
  {
    orderId: { type: String },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    vendorId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    productId: { type: Schema.Types.ObjectId, required: true, ref: "product" },
    quantity: { type: Number },
    totalPrice: { type: Number },
    address: { type: String },
    pincode: { type: String },
    city: { type: String },
    state: { type: String },
    status: {
      type: String,
      enum: { values: [...Object.values(ORDER_STATUS)], message: "Invalid Status" },
      default: ORDER_STATUS.PLACED
    }
  },
  {
    timestamps: true,
    autoCreate: true,
    versionKey: false
  }
)

module.exports = model('order', orderSchema, "order");