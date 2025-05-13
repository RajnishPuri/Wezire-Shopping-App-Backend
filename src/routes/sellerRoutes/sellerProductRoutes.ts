import express from 'express';

import { createProduct, updateProductDetails, getAllCategory, getAllBrand, getCategorySearch, getBrandSearch, getMyProducts } from '../../controllers/Seller/productController';
import { authenticateSeller } from '../../middlewares/sellerAuth.middleware';

const router = express.Router();


router.post('/createProduct', authenticateSeller as any, createProduct as any);
router.put('/updateProduct/:productId', authenticateSeller as any, updateProductDetails as any);
router.get('/getAllCategory', getAllCategory as any);
router.get('/getAllBrand', getAllBrand as any);
router.get('/getCategorySearch', getCategorySearch as any);
router.get('/getBrandSearch', getBrandSearch as any);
router.post('/getMyProducts', authenticateSeller as any, getMyProducts as any);


export default router;