const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { verifyCompany } = require('../middleware/auth');

// Company: Get all sales
router.get('/company/all', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const sales = await Sale.find({ companyId }).sort({ createdAt: -1 });
    res.json({ sales });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Get single sale
router.get('/company/:saleId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const sale = await Sale.findOne({ _id: req.params.saleId, companyId }).populate('companyId');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    // Get company data
    const Company = require('../models/Company');
    const company = await Company.findById(companyId);
    
    res.json({ sale, company });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Create new sale
router.post('/company/create', verifyCompany, async (req, res) => {
  try {
    const {
      serialNumber,
      supplierName,
      supplierNameUrdu,
      supplierVehicleNumber,
      sellerName,
      sellerNameUrdu,
      sellerNumber,
      items,
      totalItems,
      subtotal,
      discount,
      salesTax,
      totalAmount,
      paymentMethod,
      amountPaid,
      date
    } = req.body;
    const companyId = req.user.id;

    // Auto-increment serial number if not provided or empty
    let finalSerialNumber = serialNumber?.toString().trim() || '';
    if (!finalSerialNumber) {
      // Find all sales for this company and get the highest serial number
      const allSales = await Sale.find({ companyId }).select('serialNumber');
      let maxSerial = 0;
      
      allSales.forEach(sale => {
        const sn = sale.serialNumber?.toString().trim() || '';
        const num = parseInt(sn, 10);
        if (!isNaN(num) && num > maxSerial) {
          maxSerial = num;
        }
      });
      
      finalSerialNumber = String(maxSerial + 1);
    }

    const sale = new Sale({
      companyId,
      serialNumber: finalSerialNumber,
      supplierName: supplierName || '',
      supplierNameUrdu: supplierNameUrdu || '',
      supplierVehicleNumber: supplierVehicleNumber || '',
      sellerName: sellerName || '',
      sellerNameUrdu: sellerNameUrdu || '',
      sellerNumber: sellerNumber || '',
      items: items || [],
      totalItems: totalItems || 0,
      subtotal: subtotal || 0,
      discount: discount || 0,
      salesTax: salesTax || 0,
      totalAmount: totalAmount || 0,
      paymentMethod: paymentMethod || '',
      amountPaid: amountPaid || 0,
      date: date ? new Date(date) : new Date()
    });

    await sale.save();

    res.json({
      message: 'Sale created successfully',
      sale
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Update sale
router.put('/company/:saleId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const sale = await Sale.findOne({ _id: req.params.saleId, companyId });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const {
      supplierName,
      supplierNameUrdu,
      supplierVehicleNumber,
      sellerName,
      sellerNameUrdu,
      sellerNumber,
      items,
      totalItems,
      subtotal,
      discount,
      salesTax,
      totalAmount,
      paymentMethod,
      amountPaid,
      date
    } = req.body;

    if (supplierName !== undefined) sale.supplierName = supplierName;
    if (supplierNameUrdu !== undefined) sale.supplierNameUrdu = supplierNameUrdu;
    if (supplierVehicleNumber !== undefined) sale.supplierVehicleNumber = supplierVehicleNumber;
    if (sellerName !== undefined) sale.sellerName = sellerName;
    if (sellerNameUrdu !== undefined) sale.sellerNameUrdu = sellerNameUrdu;
    if (sellerNumber !== undefined) sale.sellerNumber = sellerNumber;
    if (items !== undefined) sale.items = items;
    if (totalItems !== undefined) sale.totalItems = totalItems;
    if (subtotal !== undefined) sale.subtotal = subtotal;
    if (discount !== undefined) sale.discount = discount;
    if (salesTax !== undefined) sale.salesTax = salesTax;
    if (totalAmount !== undefined) sale.totalAmount = totalAmount;
    if (paymentMethod !== undefined) sale.paymentMethod = paymentMethod;
    if (amountPaid !== undefined) sale.amountPaid = amountPaid;
    if (date !== undefined) sale.date = new Date(date);

    await sale.save();

    res.json({
      message: 'Sale updated successfully',
      sale
    });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Delete sale
router.delete('/company/:saleId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const sale = await Sale.findOneAndDelete({ _id: req.params.saleId, companyId });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

