const products = require("../models/productmodels");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/ApiFeatures");

// create Product -- Admin
exports.createProduct = catchAsyncError(async (req, resp, next) => {
  req.body.user = req.user.id;
  const productData = await products.create(req.body);
  resp.status(202).json({
    sucess: true,
    productData,
  });
});

//get All product
exports.getAllProducts = catchAsyncError(async (reqs, resp, next) => {
  const resultPerPage = 5;
  const productCount = await products.countDocuments(); // this is used to count total no of entrey have been done in database;
  const apiFeatures = new ApiFeatures(products.find(), reqs.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const product = await apiFeatures.query;
  resp.status(202).json({
    sucess: true,
    productCount,
    product,
  });
});

// update Product -- Admin

exports.updateProduct = catchAsyncError(async (req, resp, next) => {
  let product = await products.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }
  product = await products.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  resp.status(200).json({
    sucess: true,
    product,
  });
});

// delete Proudct --Admin

exports.deleteProudct = catchAsyncError(async (reqs, resp, next) => {
  let product = await products.findById(reqs.params.id);
  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }
  await products.deleteOne({ _id: reqs.params.id });
  resp.status(200).json({
    sucess: true,
    message: "Proudct have been successfully deleted",
  });
});

// get Single product

exports.getSingleProducts = catchAsyncError(async (reqs, resp, next) => {
  let product = await products.findById(reqs.params.id);
  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }
  resp.status(200).json({
    sucess: true,
    product,
  });
});

// create new Review or update the review

exports.createOrUpdateReview = catchAsyncError(async (reqs, resp, next) => {
  // const user=await findById(reqs.user.id);
  const { rating, comment, produtId } = reqs.body;

  const userReview = {
    user: reqs.user._id,
    name: reqs.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await products.findById(produtId);

  if (!product) {
    return next(new ErrorHandler("prdouct not found", 400));
  }

  const isReviewed = product.reviews.find(
    (rev) => rev.user?.toString() === reqs.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user?.toString() === reqs.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(userReview);
    product.numOfReviews = product.reviews.length;
  }
  let avg = 0;
  product.ratings = product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({
    validateBeforeSave: false,
  });

  resp.status(200).json({
    sucess: true,
    message: "Product reviewed sucessfully",
  });
});

// Get All Reviews

exports.getAllReviews = catchAsyncError(async (reqs, resp, next) => {
  const product = await products.findById(reqs.query.productId);

  if (!product) {
    return next(
      new ErrorHandler(`product not found with the id :${reqs.query.id}`, 400)
    );
  }

  const reviews = product.reviews;

  resp.status(200).json({
    sucess: true,
    reviews,
  });
});

// delete review

exports.delteReviews = catchAsyncError(async (reqs, resp, next) => {
  const product = await products.findById(reqs.query.productId);

  if (!product) {
    return next(
      new ErrorHandler(`product not found with the id :${reqs.query.id}`, 400)
    );
  }
  const reviews = product.reviews.filter(
    (rev) => rev._id?.toString() !== reqs.query.id?.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = reviews.length ? avg / reviews.length : 0;
  const numOfReviews = reviews.length;

  await products.findByIdAndUpdate(
    reqs.query.productId,
    {
      ratings,
      numOfReviews,
      reviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  resp.status(200).json({
    sucess: true,
    message: "Review has been sucssfully deleted ",
  });
});
