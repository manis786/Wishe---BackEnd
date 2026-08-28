import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.routes.js'; // Apne folder path ke mutabiq import adjust kar lena
import productRoutes from './routes/product.routes.js'
import connectDB from './config/connectDB.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connect Call
// connectDB();


// Connect to MongoDB from Vercel
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Routes

app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('WISHÉ Backend API is Running...');
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});