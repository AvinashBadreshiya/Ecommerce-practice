const { Schema, model } = require('mongoose');

const cartSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
        productId: { type: Schema.Types.ObjectId, required: true, ref: "product" },
        quantity: { type: Number },
        totalPrice: { type: Number }
    }, {
    timestamps: true,
    autoCreate: true,
    versionKey: false
}
)

module.exports = model('cart', cartSchema, "cart");