import express from 'express';

import { createProduct, updateProductDetails } from '../../controllers/Seller/productController';
import { authenticateSeller } from '../../middlewares/sellerAuth.middleware';

const router = express.Router();


router.post('/createProduct', authenticateSeller as any, createProduct as any);
router.put('/updateProduct/:productId', authenticateSeller as any, updateProductDetails as any);

export default router;