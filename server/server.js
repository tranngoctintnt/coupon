const express = require('express');
const app = express();
const cors = require('cors');
const couponRoutes = require('./routes/coupon');
app.use(express.json());
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
   
  ];
  

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use('/api', couponRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));