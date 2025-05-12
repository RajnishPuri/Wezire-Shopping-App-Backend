import express from 'express';

import { getCustomerOrders } from '../../controllers/Customer/customerOrderController';
import { authenticateCustomer } from '../../middlewares/userAuth.middleware';

const router = express.Router();
router.get('/getCustomerOrders', authenticateCustomer as any, getCustomerOrders as any);

export default router;