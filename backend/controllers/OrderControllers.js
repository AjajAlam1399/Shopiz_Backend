const Order = require("../models/Ordermodels");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const Product = require("../models/productmodels");

// create order --(users)
exports.createOrder = catchAsyncError(async (reqs, resp, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = reqs.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    user: reqs.user._id,
    paidAt: Date.now(),
  });

  resp.status(201).json({
    sucess: true,
    order,
  });
});

// get all orders (--admin)
exports.getAllorders = catchAsyncError(async (reqs, resp, next) => {
  const order = await Order.find();

  let totalamount = 0;

  order.forEach((ord) => (totalamount += ord.totalPrice));

  resp.status(200).json({ sucess: true, totalamount, order });
});

// get single order
exports.getSingleOrder = catchAsyncError(async (reqs, resp, next) => {
  const order = await Order.findById(reqs.params.id).populate(
    "user",
    "name email"
  ); // populate will going to get the name and email of user by using user field that we have been created in order models
  if (!order) {
    return next(new ErrorHandler("order not found", 400));
  }

  resp.status(200).json({
    sucess: true,
    order,
  });
});

// get logged in user order

exports.myOrder = catchAsyncError(async (reqs, resp, next) => {
  const order = await Order.find({ user: reqs.user._id });

  resp.status(200).json({
    sucess: true,
    order,
  });
});

// update order status (--admin)
exports.updateOrderStatus = catchAsyncError(async (reqs, resp, next) => {
  // const {orderStatus}=reqs.body;
  const order = await Order.findById(reqs.params.id);
  if (!order) {
    return next(new ErrorHandler("order not found", 400));
  }
  if (order.orderStatus === "Deliverd") {
    return next(new ErrorHandler("Order has allready been deliverd", 404));
  }
  order.orderItems.forEach(async (ord) => {
    await updateStock(ord.product, ord.quantity);
  });

  order.orderStatus = reqs.body.status;
  if (order.orderStatus === "Deliverd") {
    order.deliveredAt = Date.now();
  }
  await order.save({
    validateBeforeSave: false,
  });

  resp.status(200).json({
    sucess: "true",
    message: "Order status have been updated",
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;
  await product.save({
    validateBeforeSave: false,
  });
}

// delete order  (--admin)

exports.deleteOrder = catchAsyncError(async (reqs, resp, next) => {
  const order = await Order.findById(reqs.params.id);
  if (!order) {
    return next(new ErrorHandler("order not found", 400));
  }
  // deleting order
  await Order.deleteOne({ _id: reqs.params.id });

  resp.status(200).json({
    sucess: true,
    message: "order has been sucessfuly deleted",
  });
});
