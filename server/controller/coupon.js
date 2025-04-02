const express = require('express');
const sql = require("mssql");
const dbConfig = require('../config/db');
const app = express();




app.use(express.json());
// const { dbConfig} = require("../config/db");

// Initialize connection pool once
let poolPromise = sql.connect(dbConfig)
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit if connection fails
    });

// Middleware for JSON parsing
app.use(express.json());


const importFromExcel = async (req, res) => {
    try {
        const {NameCustomer, CodeCoupon, Phone, Email, IsActive } = req.body;
    
        if (!NameCustomer || !CodeCoupon || !Phone || !Email) {
          return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (!/^\d{10}$/.test(Phone)) {
          return res.status(400).json({ success: false, message: 'Phone must be exactly 10 digits' });
        }
    
        const pool = await poolPromise;
        const result = await pool.request()
        .input('NameCustomer', sql.NVarChar, NameCustomer)
          .input('CodeCoupon', sql.NVarChar, CodeCoupon)
          .input('Phone', sql.Char(10), Phone)
          .input('Email', sql.NVarChar, Email)
          .input('IsActive', sql.Bit, IsActive !== undefined ? IsActive : 0)
          .query('INSERT INTO CheckCoupon (NameCustomer,CodeCoupon, Phone, Email, IsActive, CreatedAt) VALUES (@NameCustomer,@CodeCoupon, @Phone, @Email, @IsActive, GETDATE()); SELECT SCOPE_IDENTITY() as id');
    
        res.status(201).json({
          success: true,
          data: {
            Id: result.recordset[0].id,
            NameCustomer,
            CodeCoupon,
            Phone,
            Email,
            IsActive: IsActive !== undefined ? IsActive : 0,
            CreatedAt: new Date()
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
  };
const getAllCoupon = async(req, res) =>{
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM CheckCoupon');
            console.log(result);

        if (result.recordset.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No coupon found' 
            });
        }

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error in getAllCoupon:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
const editStatusCoupon = async (req, res) => {
    try {
      const {NameCustomer, CodeCoupon, Phone, Email, IsActive } = req.body;
  
      if (!NameCustomer || !CodeCoupon || !Phone || !Email || IsActive === undefined) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }
      if (!/^\d{10}$/.test(Phone)) {
        return res.status(400).json({ success: false, message: 'Phone must be exactly 10 digits' });
      }
  
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Id', sql.Int, req.params.id)
        .input('NameCustomer', sql.NVarChar, NameCustomer)
        .input('CodeCoupon', sql.NVarChar, CodeCoupon)
        .input('Phone', sql.Char(10), Phone)
        .input('Email', sql.NVarChar, Email)
        .input('IsActive', sql.Bit, IsActive)
        .query('UPDATE CheckCoupon SET NameCustomer = @NameCustomer, CodeCoupon = @CodeCoupon, Phone = @Phone, Email = @Email, IsActive = @IsActive, UpdateAt = GETDATE() WHERE Id = @Id');
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
  
      res.json({ success: true, message: 'Coupon updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const searchCoupon = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query; // Lấy tham số từ query
        const offset = (page - 1) * limit;
    
        const pool = await poolPromise;
        const searchQuery = `%${search}%`; // Thêm ký tự wildcard cho tìm kiếm LIKE
    
        const result = await pool.request()
          .input('search', sql.NVarChar, searchQuery)
          .input('offset', sql.Int, offset)
          .input('limit', sql.Int, parseInt(limit))
          .query(`
            SELECT * FROM CheckCoupon 
            WHERE NameCustomer LIKE @search OR CodeCoupon LIKE @search OR Phone LIKE @search OR Email LIKE @search
            ORDER BY Id
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
            SELECT COUNT(*) as total FROM CheckCoupon 
            WHERE NameCustomer LIKE @search OR CodeCoupon LIKE @search OR Phone LIKE @search OR Email LIKE @search;
          `);
    
        const coupons = result.recordsets[0];
        const total = result.recordsets[1][0].total;
    
        res.json({
          success: true,
          data: coupons,
          page: parseInt(page),
          total: total,
        });
      } catch (error) {
        console.error('Error in /api/coupon/search:', error);
        res.status(500).json({ success: false, message: error.message });
      }
};

const userSearchCoupon = async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT TOP 50 * FROM CheckCoupon"; // Giới hạn 50 kết quả
    let params = [];
    if (search) {
      query += ` WHERE NameCustomer LIKE @search OR Email LIKE @search OR Phone LIKE @search AND isActive = 0`;
      params.push({ name: "search", type: sql.NVarChar, value: `%${search}%` });
    }

    const pool = await poolPromise;
    const request = pool.request();
    params.forEach(param => request.input(param.name, param.type, param.value));

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {importFromExcel,editStatusCoupon,getAllCoupon,searchCoupon, userSearchCoupon}