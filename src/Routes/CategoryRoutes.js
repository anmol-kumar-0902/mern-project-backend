const express=require("express")
const router = express.Router();
const path = require("path");
const Category = require("../Models/CategoryModel")
const slugify = require("slugify");
const shortid = require("shortid");
const multer = require("multer");
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


function createCategories(categories, parentId = null) {
    const categoryList = [];
    let category;
    if (parentId == null) {
        category = categories.filter((cat) => cat.parentId == undefined);
    } else {
        category = categories.filter((cat) => cat.parentId == parentId);
    }

    for (let cate of category) {
        categoryList.push({
            _id: cate._id,
            name: cate.name,
            slug: cate.slug,
            parentId: cate.parentId,
            type: cate.type,
            children: createCategories(categories, cate._id),
        });
    }

    return categoryList;
}

router.post("/category/create", requireSignIn,adminMiddleware, upload.single("categoryImage"), (req, res) => {
    const categoryObj = {
        name: req.body.name,
        slug: `${slugify(req.body.name)}`,
    };

    if (req.file) {
        categoryObj.categoryImage = "/public/" + req.file.filename;
    }

    if (req.body.parentId) {
        categoryObj.parentId = req.body.parentId;
    }

    const cat = new Category(categoryObj);
    cat.save((error, category) => {
        if (error) return res.status(400).json({ error });
        if (category) {
            return res.status(201).json({ category });
        }
    });
});


router.get("/category/getcategory", (req, res) => {
    Category.find({}).exec((error, categories) => {
        if (error) return res.status(400).json({ error });
        if (categories) {
            const categoryList = createCategories(categories);
            res.status(200).json({ categoryList });
        }
    });
});


module.exports = router;