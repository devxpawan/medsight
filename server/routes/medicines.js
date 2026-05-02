const router = require('express').Router();
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/', auth, upload.array('images', 3), async (req, res) => {
  try {
    const { name, illness, notes } = req.body;
    
    const imageUrls = req.files.map(file => {
      return `/uploads/${file.filename}`;
    });

    const newMedicine = new Medicine({
      user_id: req.user.id,
      name,
      illness,
      notes,
      image_urls: imageUrls
    });

    const savedMedicine = await newMedicine.save();
    res.status(201).json(savedMedicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 }).limit(100);
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    let uploaderName = null;
    if (medicine.user_id) {
      const uploader = await User.findById(medicine.user_id);
      if (uploader) {
        uploaderName = uploader.displayName;
      }
    }
    
    res.json({
      ...medicine.toObject(),
      uploaderName
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.array('images', 3), async (req, res) => {
  try {
    const { name, illness, notes } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    if (medicine.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this medicine' });
    }
    
    if (name !== undefined) medicine.name = name;
    if (illness !== undefined) medicine.illness = illness;
    if (notes !== undefined) medicine.notes = notes;
    
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      medicine.image_urls = imageUrls;
    }
    
    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
