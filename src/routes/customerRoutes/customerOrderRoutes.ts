import express from 'express';

import { getCustomerOrders, getOrderById } from '../../controllers/Customer/customerOrderController';
import { authenticateCustomer } from '../../middlewares/userAuth.middleware';

const router = express.Router();
router.get('/getCustomerOrders', authenticateCustomer as any, getCustomerOrders as any);
router.get('/getOrderById/:orderId', authenticateCustomer as any, getOrderById as any);

export default router;