const { json } = require("express");
const products = require("../models/productmodels");

class ApiFeatures {
  constructor(query, querystr) {
    // http://localhost:80006?keyword=somasa -- here keyword is querystr  and products.find() is query
    this.query = query;
    this.querystr = querystr;
  }

  //search features
  search() {
    const keyword = this.querystr.keyword
      ? {
          name: {
            $regex: this.querystr.keyword,
            $options: "i", // means case insensentive
          },
        }
      : {};

    // console.log(keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.querystr }; // we have done destructuring here because it give me refernce not the actural value
    // Removing some field for catergory
    // console.log(queryCopy);
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // filter for price
    let queryCpystry = JSON.stringify(queryCopy);

    queryCpystry = queryCpystry.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (key) => `$${key}`
    ); // .replace(/\b()\b/g,kery=>`$${key}`)
    this.query = this.query.find(JSON.parse(queryCpystry));

    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.querystr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.find().limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
