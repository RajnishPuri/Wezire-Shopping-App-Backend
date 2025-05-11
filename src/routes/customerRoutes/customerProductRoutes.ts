import express from 'express';

import { getAllProducts, searchItemList, getProductById } from '../../controllers/Customer/costomerProductController';
import { authenticateCustomer } from '../../middlewares/userAuth.middleware';

const router = express.Router();

router.post('/getAllProducts', getAllProducts as any);
// router.post('/getFilterProduct', authenticateCustomer as any, getFilterProduct as any);
router.get('/searchItemList', searchItemList as any);
// router.get('/searchProducts', searchProducts as any);
router.get('/getProductById/:id', getProductById as any);


export default router;