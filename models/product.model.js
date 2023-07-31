const { Schema, model } = require('mongoose');
const { PRODUCT_STATUS } = require("../json/enums.json");

const productSchema = new Schema(
  {
    company: { type: String, required: true },
    model: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
    ram: { type: String, required: true },
    rom: { type: String, required: true },
    color: { type: String, required: true },
    chargerType: { type: String, required: true },
    chargerWatt: { type: Number, required: true },
    frontCamera: { type: String, required: true },
    rearCamera: { type: String, required: true },
    stock: { type: Number, required: true },
    status: {
      type: String,
      enum: {
        values: [...Object.values(PRODUCT_STATUS)],
        message: "Invalid status"
      },
      default: PRODUCT_STATUS.PENDING, required: true
    },
    vendorId: { type: Schema.Types.ObjectId, required: true, ref: "user" }
  },
  {
    timestamps: true,
    autoCreate: true,
    versionKey: false
  }
)

module.exports = model('product', productSchema, "product");