const express = require("express");
const slugify = require("slugify");
const Category = require("../Models/CategoryModel");
const multer = require("multer");
const Product= require("../Models/ProductModel")
const router = express.Router();
const shortid = require("shortid");
const path = require("path");
const { requireSignIn, adminMiddleware } = require("../Common-MiddleWare/commonMiddleWare");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) { 
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/product/create",requireSignIn, adminMiddleware,upload.array("productPicture"),(req, res) => {
    //res.status(200).json( { file: req.files, body: req.body } );
  
    const { name, price, description, category, quantity } = req.body;
    let productPictures = [];
  
    if (req.files.length > 0) {
      productPictures = req.files.map((file) => {
        return { img: file.filename };
      });
    }
  
    const product = new Product({
      name: name,
      slug: slugify(name),
      price,
      quantity,
      description,
      productPictures,
      category,
    });
  
    product.save((error, product) => {
      if (error) return res.status(400).json({ error });
      if (product) {
        res.status(201).json({ product, files: req.files });
      }
    });
  });
router.get("/product/:slug", (req, res) => {
    const { slug } = req.params;
    Category.findOne({ slug: slug })
      .select("_id type")
      .exec((error, category) => {
        if (error) {
          return res.status(400).json({ error });
        }
  
        if (category) {
          Product.find({ category: category._id }).exec((error, products) => {
            if (error) {
              return res.status(400).json({ error });
            }
  
            if (category.type) {
              if (products.length > 0) {
                res.status(200).json({
                  products,
                  priceRange: {
                    under5k: 5000,
                    under10k: 10000,
                    under15k: 15000,
                    under20k: 20000,
                    under30k: 30000,
                  },
                  productsByPrice: {
                    under5k: products.filter((product) => product.price <= 5000),
                    under10k: products.filter(
                      (product) => product.price > 5000 && product.price <= 10000
                    ),
                    under15k: products.filter(
                      (product) => product.price > 10000 && product.price <= 15000
                    ),
                    under20k: products.filter(
                      (product) => product.price > 15000 && product.price <= 20000
                    ),
                    under30k: products.filter(
                      (product) => product.price > 20000 && product.price <= 30000
                    ),
                  },
                });
              }
            } else {
              res.status(200).json({ products });
            }
          });
        }
      });
  });
router.get("/product/:productId", (req, res) => {
    const { productId } = req.params;
    if (productId) {
      Product.findOne({ _id: productId }).exec((error, product) => {
        if (error) return res.status(400).json({ error });
        if (product) {
          res.status(200).json({ product });
        }
      });
    } else {
      return res.status(400).json({ error: "Params required" });
    }
  });
router.delete("/product/deleteProductById",requireSignIn,adminMiddleware,(req, res) => {
    const { productId } = req.body.payload;
    if (productId) {
      Product.deleteOne({ _id: productId }).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        }
      });
    } else {
      res.status(400).json({ error: "Params required" });
    }
  });
router.post("/product/getProducts",requireSignIn,adminMiddleware,async (req, res) => {
    const products = await Product.find({ createdBy: req.user._id })
      .select("_id name price quantity slug description productPictures category")
      .populate({ path: "category", select: "_id name" })
      .exec();
  
    res.status(200).json({ products });
  });

module.exports = router;