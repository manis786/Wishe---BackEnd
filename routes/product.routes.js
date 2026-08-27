import express from 'express';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    addProductReview 
} from '../controller/product.controller.js';
import { upload } from '../config/config.js'; 

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/review', addProductReview);

export default router;