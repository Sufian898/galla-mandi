const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/PaymentMethod');
const { verifyAdmin } = require('../middleware/auth');

// Admin: Get all payment methods
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    let methods = await PaymentMethod.find().sort({ order: 1, createdAt: -1 });
    
    // If no methods exist, create default ones
    if (methods.length === 0) {
      const defaultMethods = [
        { name: 'Easypaisa', nameUrdu: 'ایزی پیسہ', isActive: true, order: 1 },
        { name: 'Punjab Bank', nameUrdu: 'پنجاب بینک', isActive: true, order: 2 },
        { name: 'Nakad Raqam', nameUrdu: 'نقد رقم', isActive: true, order: 0 }
      ];
      
      await PaymentMethod.insertMany(defaultMethods);
      methods = await PaymentMethod.find().sort({ order: 1, createdAt: -1 });
    }
    
    res.json({ paymentMethods: methods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public: Get active payment methods (for company use)
router.get('/active', async (req, res) => {
  try {
    let methods = await PaymentMethod.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    
    // If no methods exist, create default ones
    if (methods.length === 0) {
      const defaultMethods = [
        { name: 'Easypaisa', nameUrdu: 'ایزی پیسہ', isActive: true, order: 1 },
        { name: 'Punjab Bank', nameUrdu: 'پنجاب بینک', isActive: true, order: 2 },
        { name: 'Nakad Raqam', nameUrdu: 'نقد رقم', isActive: true, order: 0 }
      ];
      
      await PaymentMethod.insertMany(defaultMethods);
      methods = await PaymentMethod.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    }
    
    res.json({ paymentMethods: methods });
  } catch (error) {
    console.error('Get active payment methods error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Create new payment method
router.post('/admin/create', verifyAdmin, async (req, res) => {
  try {
    const { name, nameUrdu, isActive, order } = req.body;

    const paymentMethod = new PaymentMethod({
      name: name || '',
      nameUrdu: nameUrdu || '',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    await paymentMethod.save();

    res.json({
      message: 'Payment method created successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Create payment method error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update payment method
router.put('/admin/:methodId', verifyAdmin, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.methodId);
    
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const { name, nameUrdu, isActive, order } = req.body;

    if (name !== undefined) paymentMethod.name = name;
    if (nameUrdu !== undefined) paymentMethod.nameUrdu = nameUrdu;
    if (isActive !== undefined) paymentMethod.isActive = isActive;
    if (order !== undefined) paymentMethod.order = order;

    await paymentMethod.save();

    res.json({
      message: 'Payment method updated successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete payment method
router.delete('/admin/:methodId', verifyAdmin, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.methodId);
    
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

