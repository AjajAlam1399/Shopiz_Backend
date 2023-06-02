const mongoose = require("mongoose");

const orderSchemas = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: [true, "please Enter shipping Adresss"],
    },
    city: {
      type: String,
      required: [true, "Enter shipping city"],
    },
    state: {
      type: String,
      required: [true, "Enter shipping State"],
    },
    country: {
      type: String,
      required: [true, "Enter shipping country"],
    },
    pinCode: {
      type: Number,
      required: [true, "Enter shipping pinCode"],
    },
    phoneNo: {
      type: Number,
      required: [true, "Enter shipping Phone no"],
    },
  },
  orderItems: [
    {
      name: {
        type: String,
        required: [true, "Enter order Name"],
      },
      quantity: {
        type: Number,
        required: [true, "Enter order Quantity"],
      },
      Price: {
        type: Number,
        required: [true, "Enter order Price"],
      },
      image: {
        type: String,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: true,
  },
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  paidAt: {
    type: Date,
    required: true,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "processing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const orderModels = new mongoose.model("Order", orderSchemas);

module.exports = orderModels;
