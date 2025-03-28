const express = require('express');
const sql = require("mssql");
const dbConfig = require('../config/db');
const app = express();
const router = express.Router();

const couponCtl = require('../controller/coupon')

router.post('/coupon', couponCtl.importFromExcel);
router.put('/coupon/:id', couponCtl.editStatusCoupon);

router.get('/coupon', couponCtl.getAllCoupon);
router.get('/coupon/search', couponCtl.searchCoupon);
router.get('/coupon-user', couponCtl.userSearchCoupon);



module.exports = router;
