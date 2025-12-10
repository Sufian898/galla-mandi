const express = require('express');
const router = express.Router();
const Recovery = require('../models/Recovery');
const Bank = require('../models/Bank');
const BankTransaction = require('../models/BankTransaction');
const { verifyCompany } = require('../middleware/auth');

// Company: Get all recoveries
router.get('/company/all', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const recoveries = await Recovery.find({ companyId }).sort({ createdAt: -1 });
    res.json({ recoveries });
  } catch (error) {
    console.error('Get recoveries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Get single recovery
router.get('/company/:recoveryId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const recovery = await Recovery.findOne({ _id: req.params.recoveryId, companyId });
    
    if (!recovery) {
      return res.status(404).json({ message: 'Recovery not found' });
    }
    
    // Fetch company data
    const Company = require('../models/Company');
    const company = await Company.findById(companyId);
    
    res.json({ recovery, company });
  } catch (error) {
    console.error('Get recovery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Create new recovery
router.post('/company/create', verifyCompany, async (req, res) => {
  try {
    const {
      serialNumber,
      customerName,
      customerNameUrdu,
      customerVehicleNumber,
      customerPhone,
      recoveryAmount,
      paymentMethod,
      bankId,
      description,
      descriptionUrdu,
      date
    } = req.body;
    const companyId = req.user.id;

    // Auto-increment serial number if not provided or empty
    let finalSerialNumber = serialNumber?.toString().trim() || '';
    if (!finalSerialNumber) {
      // Find all recoveries for this company and get the highest serial number
      const allRecoveries = await Recovery.find({ companyId }).select('serialNumber');
      let maxSerial = 0;
      
      allRecoveries.forEach(recovery => {
        const sn = recovery.serialNumber?.toString().trim() || '';
        const num = parseInt(sn, 10);
        if (!isNaN(num) && num > maxSerial) {
          maxSerial = num;
        }
      });
      
      finalSerialNumber = String(maxSerial + 1);
    }

    const recovery = new Recovery({
      companyId,
      serialNumber: finalSerialNumber,
      customerName: customerName || '',
      customerNameUrdu: customerNameUrdu || '',
      customerVehicleNumber: customerVehicleNumber || '',
      customerPhone: customerPhone || '',
      recoveryAmount: recoveryAmount || 0,
      paymentMethod: paymentMethod || '',
      description: description || '',
      descriptionUrdu: descriptionUrdu || '',
      date: date ? new Date(date) : new Date()
    });

    await recovery.save();

    // If payment method is a bank, create bank transaction
    if (paymentMethod && recoveryAmount > 0) {
      try {
        let bank = null;
        
        // First try to find bank by bankId if provided (only admin-managed banks)
        if (bankId) {
          bank = await Bank.findOne({ 
            _id: bankId,
            companyId,
            isAdminManaged: true,
            isActive: true
          });
        }
        
        // If not found, try to find by payment method name (only admin-managed banks)
        if (!bank) {
          bank = await Bank.findOne({ 
            companyId,
            isAdminManaged: true,
            $or: [
              { bankName: paymentMethod },
              { bankNameUrdu: paymentMethod }
            ],
            isActive: true
          });
        }

        if (bank) {
          // Calculate current balance
          const allTransactions = await BankTransaction.find({ bankId: bank._id })
            .sort({ date: 1, createdAt: 1 });
          
          let currentBalance = bank.openingBalance || 0;
          allTransactions.forEach(tx => {
            if (tx.type === 'deposit') {
              currentBalance += tx.amount;
            } else {
              currentBalance -= tx.amount;
            }
          });

          // Create deposit transaction
          const bankTransaction = new BankTransaction({
            companyId,
            bankId: bank._id,
            recoveryId: recovery._id,
            date: date ? new Date(date) : new Date(),
            type: 'deposit',
            amount: recoveryAmount,
            paymentMethod: paymentMethod,
            description: `Recovery #${finalSerialNumber} - ${customerNameUrdu || customerName}`,
            descriptionUrdu: `ریکوری #${finalSerialNumber} - ${customerNameUrdu || customerName}`,
            balanceAfter: currentBalance + recoveryAmount
          });

          await bankTransaction.save();
        }
      } catch (bankError) {
        console.error('Create bank transaction error:', bankError);
        // Don't fail recovery creation if bank transaction fails
      }
    }

    res.json({
      message: 'Recovery created successfully',
      recovery
    });
  } catch (error) {
    console.error('Create recovery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Update recovery
router.put('/company/:recoveryId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const recovery = await Recovery.findOne({ _id: req.params.recoveryId, companyId });
    
    if (!recovery) {
      return res.status(404).json({ message: 'Recovery not found' });
    }

    const {
      customerName,
      customerNameUrdu,
      customerVehicleNumber,
      customerPhone,
      recoveryAmount,
      paymentMethod,
      description,
      descriptionUrdu,
      date
    } = req.body;

    if (customerName !== undefined) recovery.customerName = customerName;
    if (customerNameUrdu !== undefined) recovery.customerNameUrdu = customerNameUrdu;
    if (customerVehicleNumber !== undefined) recovery.customerVehicleNumber = customerVehicleNumber;
    if (customerPhone !== undefined) recovery.customerPhone = customerPhone;
    if (recoveryAmount !== undefined) recovery.recoveryAmount = recoveryAmount;
    if (paymentMethod !== undefined) recovery.paymentMethod = paymentMethod;
    if (description !== undefined) recovery.description = description;
    if (descriptionUrdu !== undefined) recovery.descriptionUrdu = descriptionUrdu;
    if (date !== undefined) recovery.date = new Date(date);

    await recovery.save();

    res.json({
      message: 'Recovery updated successfully',
      recovery
    });
  } catch (error) {
    console.error('Update recovery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Delete recovery
router.delete('/company/:recoveryId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const recovery = await Recovery.findOneAndDelete({ _id: req.params.recoveryId, companyId });
    
    if (!recovery) {
      return res.status(404).json({ message: 'Recovery not found' });
    }

    res.json({ message: 'Recovery deleted successfully' });
  } catch (error) {
    console.error('Delete recovery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

