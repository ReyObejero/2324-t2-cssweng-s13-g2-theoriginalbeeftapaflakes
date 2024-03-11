import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});

    res.status(200).json(products);
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId);
  
    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  });

  const updateProductInventory = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { inventory } = req.body;

    const product = await Product.findById(productId);

    if (product) {
        product.countInStock = inventory;
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error("Product not found");
    }
});

export {
    getProducts,
    getProductById,
    updateProductInventory,
};