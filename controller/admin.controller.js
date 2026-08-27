import Admin from '../models/admin.model.js';
import bcrypt from 'bcrypt';

// Login Controller
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      token: 'wishe_admin_secure_token' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Setup initial admin (Helper function agar database mein pehla admin banana ho)
export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      username,
      password: hashedPassword
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};