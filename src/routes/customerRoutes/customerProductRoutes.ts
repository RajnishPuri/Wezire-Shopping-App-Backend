import express from 'express';

import { getAllProducts } from '../../controllers/Customer/costomerProductController';
import { authenticateCustomer } from '../../middlewares/userAuth.middleware';

const router = express.Router();

router.get('/getAllProducts', authenticateCustomer as any, getAllProducts as any);

export default router;