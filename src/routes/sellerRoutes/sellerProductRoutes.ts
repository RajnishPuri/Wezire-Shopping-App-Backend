import express from 'express';

import { createProduct, updateProductDetails, createCategory, createBrand, getAllCategory, getAllBrand, getCategorySearch, getBrandSearch } from '../../controllers/Seller/productController';
import { authenticateSeller } from '../../middlewares/sellerAuth.middleware';

const router = express.Router();


router.post('/createProduct', authenticateSeller as any, createProduct as any);
router.put('/updateProduct/:productId', authenticateSeller as any, updateProductDetails as any);
router.post('/createCategory', authenticateSeller as any, createCategory as any);
router.post('/createBrand', authenticateSeller as any, createBrand as any);
router.get('/getAllCategory', getAllCategory as any);
router.get('/getAllBrand', getAllBrand as any);
router.get('/getCategorySearch', getCategorySearch as any);
router.get('/getBrandSearch', getBrandSearch as any);


export default router;