import express from 'express';

import { createProduct } from '../../controllers/Seller/productController';
import { authenticateSeller } from '../../middlewares/sellerAuth.middleware';

const router = express.Router();


router.post('/createProduct', authenticateSeller as any, createProduct as any);

export default router;