const express = require("express");
const { userMiddleware, requireSignIn } = require("../Common-MiddleWare/commonMiddleWare");
const router = express.Router();
const Cart = require("../Models/CartModel");

router.post("/user/cart/add-to-cart", requireSignIn, userMiddleware, (req, res) => {
    Cart.findOne({ user: req.user._id })
        .exec((error, cart) => {
            if (error) return res.status(400).json({ error });
            if (cart) {//if cart already exist then upadte the cart
                //check if the item is already added or not. if added then only update the quantity not adding it again as another item
                const cartProd = req.body.cartItems.product;
                const IsItem = cart.cartItems.find(c => c.product == cartProd);
                let condition, action;
                if (IsItem) {
                    condition = { user: req.user._id, "cartItems.product": cartProd };
                    action = {
                        "$set": {
                            "cartItems.$": {
                                ...req.body.cartItems,
                                quantity: IsItem.quantity + req.body.cartItems.quantity
                            }
                        }
                    };
                }
                else {
                    condition = { user: req.user._id };
                    action = {
                        "$push": {
                            "cartItems": req.body.cartItems
                        }
                    };
                }
                Cart.findOneAndUpdate(condition, action)
                    .exec((error, _cart) => {
                        if (error) return res.status(400).json({ error });
                        if (_cart) {
                            return res.status(201).json({ cart: _cart });
                        }
                    });
            }
            else {
                //if cart is not there for the user
                const cart = new Cart({
                    user: req.user._id,
                    cartItems: [req.body.cartItems]
                })
                cart.save((error, cart) => {
                    if (error) return res.status(400).json({ error });
                    if (cart) {
                        return res.status(201).json({ cart });
                    }
                })
            }
        })
})
module.exports = router;