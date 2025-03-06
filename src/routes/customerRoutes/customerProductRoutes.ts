import express from 'express';

import { getAllProducts, getFilterProduct } from '../../controllers/Customer/costomerProductController';
import { authenticateCustomer } from '../../middlewares/userAuth.middleware';

const router = express.Router();

router.get('/getAllProducts', authenticateCustomer as any, getAllProducts as any);
router.post('/getFilterProduct', authenticateCustomer as any, getFilterProduct as any);

export default router;