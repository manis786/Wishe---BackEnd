import Product from '../models/model.product.js';

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Product by ID (Read)
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add New Product (Create) with Image Upload
export const createProduct = async (req, res) => {
    try {
        const { 
            name, 
            category, 
            categoryLabel, 
            description, 
            price50ml, 
            discountPrice50ml, 
            price100ml, 
            discountPrice100ml 
        } = req.body;
        
        const imageUrl = req.file ? req.file.path : '';

        const newProduct = new Product({
            name,
            category,
            categoryLabel,
            description,
            image: imageUrl,
            price50ml,
            discountPrice50ml: discountPrice50ml || '',
            price100ml,
            discountPrice100ml: discountPrice100ml || ''
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Error creating product:", error.message);
        res.status(400).json({ error: error.message });
    }
};
// Update Product (Update)
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            category, 
            categoryLabel, 
            description, 
            price50ml, 
            discountPrice50ml, 
            price100ml, 
            discountPrice100ml 
        } = req.body;
        
        // Pehle se mojood product find karo taake agar nayi image na ho toh purani image bachi rahe
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        let updateData = {
            name,
            category,
            categoryLabel,
            description,
            price50ml,
            discountPrice50ml: discountPrice50ml !== undefined ? discountPrice50ml : existingProduct.discountPrice50ml,
            price100ml,
            discountPrice100ml: discountPrice100ml !== undefined ? discountPrice100ml : existingProduct.discountPrice100ml,
            image: existingProduct.image // Default purani image rakho
        };

        // Agar user ne nayi image select ki hai tabhi image update ho gi
        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error.message);
        res.status(400).json({ error: error.message });
    }
};

// Delete Product (Delete)
export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Customer Review with Name and Comment
export const addProductReview = async (req, res) => {
    try {
        const { name, comment } = req.body;
        
        if (!name || !comment) {
            return res.status(400).json({ message: 'Name and comment are required' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.userReviews.push({ name, comment });
        product.reviewsCount = product.userReviews.length;
        
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};