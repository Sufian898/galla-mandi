const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');
const BankTransaction = require('../models/BankTransaction');
const { verifyCompany, verifyAdmin } = require('../middleware/auth');

// Company: Get all banks (only admin-managed banks)
router.get('/company/all', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    console.log('Fetching banks for company:', companyId);
    
    // Try multiple queries to find admin-managed banks
    // First: banks with isAdminManaged flag
    let banks = await Bank.find({ 
      companyId, 
      $or: [
        { isAdminManaged: true },
        { addedByAdmin: true }
      ],
      isActive: { $ne: false } // Include banks where isActive is true or undefined
    }).sort({ createdAt: -1 });
    
    console.log('Found banks with admin flags:', banks.length);
    
    // If still no banks, check all active banks and auto-update them
    if (banks.length === 0) {
      const allBanks = await Bank.find({ companyId, isActive: { $ne: false } }).sort({ createdAt: -1 });
      console.log('Total active banks for company:', allBanks.length);
      
      // If there are banks but they don't have admin flags, update them to be admin-managed
      if (allBanks.length > 0) {
        // Update all existing banks without admin flags to be admin-managed
        // This handles the case where banks were created before the flags were added
        const updateResult = await Bank.updateMany(
          { 
            companyId,
            $or: [
              { isAdminManaged: { $exists: false } },
              { isAdminManaged: false },
              { addedByAdmin: { $exists: false } }
            ]
          },
          { 
            $set: { 
              isAdminManaged: true,
              addedByAdmin: true 
            } 
          }
        );
        console.log('Updated banks to admin-managed:', updateResult.modifiedCount);
        
        // Fetch again after update
        banks = await Bank.find({ 
          companyId, 
          $or: [
            { isAdminManaged: true },
            { addedByAdmin: true }
          ],
          isActive: { $ne: false }
        }).sort({ createdAt: -1 });
        console.log('Found banks after update:', banks.length);
      }
    }
    
    console.log('Returning banks:', banks.length);
    res.json({ banks });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Get single bank
router.get('/company/:bankId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const bank = await Bank.findOne({ _id: req.params.bankId, companyId });
    
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }
    
    res.json({ bank });
  } catch (error) {
    console.error('Get bank error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Create new bank
router.post('/company/create', verifyCompany, async (req, res) => {
  try {
    const {
      bankName,
      bankNameUrdu,
      accountNumber,
      accountTitle,
      branchName,
      openingBalance
    } = req.body;
    const companyId = req.user.id;

    const bank = new Bank({
      companyId,
      bankName: bankName || '',
      bankNameUrdu: bankNameUrdu || '',
      accountNumber: accountNumber || '',
      accountTitle: accountTitle || '',
      branchName: branchName || '',
      openingBalance: openingBalance || 0,
      isActive: true
    });

    await bank.save();

    res.json({
      message: 'Bank created successfully',
      bank
    });
  } catch (error) {
    console.error('Create bank error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Update bank
router.put('/company/:bankId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const bank = await Bank.findOne({ _id: req.params.bankId, companyId });
    
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    const {
      bankName,
      bankNameUrdu,
      accountNumber,
      accountTitle,
      branchName,
      openingBalance,
      isActive
    } = req.body;

    if (bankName !== undefined) bank.bankName = bankName;
    if (bankNameUrdu !== undefined) bank.bankNameUrdu = bankNameUrdu;
    if (accountNumber !== undefined) bank.accountNumber = accountNumber;
    if (accountTitle !== undefined) bank.accountTitle = accountTitle;
    if (branchName !== undefined) bank.branchName = branchName;
    if (openingBalance !== undefined) bank.openingBalance = openingBalance;
    if (isActive !== undefined) bank.isActive = isActive;

    await bank.save();

    res.json({
      message: 'Bank updated successfully',
      bank
    });
  } catch (error) {
    console.error('Update bank error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Delete bank
router.delete('/company/:bankId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const bank = await Bank.findOneAndDelete({ _id: req.params.bankId, companyId });
    
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    // Also delete all transactions for this bank
    await BankTransaction.deleteMany({ bankId: bank._id });

    res.json({ message: 'Bank deleted successfully' });
  } catch (error) {
    console.error('Delete bank error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Create bank transaction by payment method (for payment method-based banks)
// IMPORTANT: This route must come BEFORE /company/:bankId/transaction to avoid route matching issues
router.post('/company/payment-method/transaction', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const PaymentMethod = require('../models/PaymentMethod');
    const Recovery = require('../models/Recovery');
    const ExpenseLedger = require('../models/ExpenseLedger');
    
    const {
      paymentMethodId,
      date,
      type,
      amount,
      description,
      descriptionUrdu
    } = req.body;

    if (!paymentMethodId || !type || !amount) {
      return res.status(400).json({ message: 'Payment method ID, type, and amount are required' });
    }

    if (!['deposit', 'withdraw'].includes(type)) {
      return res.status(400).json({ message: 'Type must be deposit or withdraw' });
    }

    // Find payment method
    const paymentMethod = await PaymentMethod.findById(paymentMethodId);
    if (!paymentMethod || !paymentMethod.isActive) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const paymentMethodName = paymentMethod.nameUrdu || paymentMethod.name;
    const paymentMethodNameEng = paymentMethod.name || '';
    
    // Build query conditions - only include non-empty values
    const paymentMethodConditions = [];
    if (paymentMethodNameEng) {
      paymentMethodConditions.push({ paymentMethod: paymentMethodNameEng });
    }
    if (paymentMethodName && paymentMethodName !== paymentMethodNameEng) {
      paymentMethodConditions.push({ paymentMethod: paymentMethodName });
    }
    
    // If no conditions, use empty array (will return no results)
    const queryCondition = paymentMethodConditions.length > 0 
      ? { companyId, $or: paymentMethodConditions }
      : { companyId, paymentMethod: paymentMethodName || paymentMethodNameEng };
    
    // Get all recoveries for this payment method (deposits)
    const recoveries = await Recovery.find(queryCondition);
    
    // Get all expenses for this payment method (withdrawals)
    const expenses = await ExpenseLedger.find(queryCondition);

    // Get existing bank transactions
    const allTransactions = await BankTransaction.find(queryCondition).sort({ date: 1, createdAt: 1 });

    // Calculate current balance
    let currentBalance = 0;
    
    // Add deposits from recoveries
    recoveries.forEach(recovery => {
      currentBalance += (recovery.recoveryAmount || 0);
    });
    
    // Subtract withdrawals from expenses
    expenses.forEach(expense => {
      const expTotal = (expense.travellingExpense || 0) + 
                      (expense.refreshment || 0) + 
                      (expense.cargo || 0) + 
                      (expense.salaryExpense || 0);
      currentBalance -= expTotal;
    });
    
    // Add/subtract from existing bank transactions
    allTransactions.forEach(tx => {
      if (tx.type === 'deposit') {
        currentBalance += (tx.amount || 0);
      } else {
        currentBalance -= (tx.amount || 0);
      }
    });

    // Calculate new balance
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    
    const balanceAfter = type === 'deposit' 
      ? currentBalance + amountNum 
      : currentBalance - amountNum;

    // Create transaction
    const transaction = new BankTransaction({
      companyId,
      bankId: null,
      date: date ? new Date(date) : new Date(),
      type,
      amount: amountNum,
      paymentMethod: paymentMethodName,
      description: description || '',
      descriptionUrdu: descriptionUrdu || '',
      balanceAfter: balanceAfter
    });

    await transaction.save();

    res.json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create payment method transaction error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Company: Get all bank transactions by payment method (for payment method-based banks)
router.get('/company/payment-method/transactions', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { paymentMethod } = req.query;
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const transactions = await BankTransaction.find({ 
      companyId,
      paymentMethod: paymentMethod
    }).sort({ date: -1, createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get payment method transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Get all bank transactions for company (all payment methods)
router.get('/company/transactions/all', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    
    const transactions = await BankTransaction.find({ 
      companyId
    }).sort({ date: -1, createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get all bank transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Get bank transactions
router.get('/company/:bankId/transactions', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const bank = await Bank.findOne({ _id: req.params.bankId, companyId });
    
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    const transactions = await BankTransaction.find({ bankId: req.params.bankId })
      .populate('recoveryId')
      .sort({ date: -1, createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get bank transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Create bank transaction (deposit/withdraw)
router.post('/company/:bankId/transaction', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const bank = await Bank.findOne({ _id: req.params.bankId, companyId });
    
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    const {
      recoveryId,
      date,
      type,
      amount,
      paymentMethod,
      description,
      descriptionUrdu
    } = req.body;

    // Calculate current balance
    const allTransactions = await BankTransaction.find({ bankId: req.params.bankId })
      .sort({ date: 1, createdAt: 1 });
    
    let currentBalance = bank.openingBalance || 0;
    allTransactions.forEach(tx => {
      if (tx.type === 'deposit') {
        currentBalance += tx.amount;
      } else {
        currentBalance -= tx.amount;
      }
    });

    // Calculate new balance
    const balanceAfter = type === 'deposit' 
      ? currentBalance + amount 
      : currentBalance - amount;

    const transaction = new BankTransaction({
      companyId,
      bankId: req.params.bankId,
      recoveryId: recoveryId || null,
      date: date ? new Date(date) : new Date(),
      type,
      amount,
      paymentMethod: paymentMethod || '',
      description: description || '',
      descriptionUrdu: descriptionUrdu || '',
      balanceAfter
    });

    await transaction.save();

    res.json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create bank transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Company: Delete bank transaction
router.delete('/company/transaction/:transactionId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const transaction = await BankTransaction.findOneAndDelete({ 
      _id: req.params.transactionId, 
      companyId 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete bank transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all banks (for all companies)
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const banks = await Bank.find({ isAdminManaged: true, isActive: true })
      .populate('companyId', 'username shopName')
      .sort({ createdAt: -1 });
    res.json({ banks });
  } catch (error) {
    console.error('Get admin banks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Create bank for all companies
router.post('/admin/create', verifyAdmin, async (req, res) => {
  try {
    const {
      bankName,
      bankNameUrdu,
      accountNumber,
      accountTitle,
      branchName,
      openingBalance
    } = req.body;

    // Get all companies
    const Company = require('../models/Company');
    const companies = await Company.find();
    console.log('Creating bank for companies:', companies.length);

    const createdBanks = [];

    // Create bank for each company
    for (const company of companies) {
      // Check if bank already exists for this company with same name and account number
      const existingBank = await Bank.findOne({
        companyId: company._id,
        bankName: bankName || '',
        accountNumber: accountNumber || '',
        isAdminManaged: true
      });

      if (existingBank) {
        // Update existing bank instead of creating duplicate
        console.log('Updating existing bank for company:', company._id);
        existingBank.bankNameUrdu = bankNameUrdu || existingBank.bankNameUrdu || '';
        existingBank.accountTitle = accountTitle || existingBank.accountTitle || '';
        existingBank.branchName = branchName || existingBank.branchName || '';
        existingBank.openingBalance = openingBalance !== undefined ? openingBalance : existingBank.openingBalance;
        existingBank.isActive = true;
        existingBank.isAdminManaged = true;
        existingBank.addedByAdmin = true;
        await existingBank.save();
        createdBanks.push(existingBank);
      } else {
        console.log('Creating new bank for company:', company._id);
        const bank = new Bank({
          companyId: company._id,
          bankName: bankName || '',
          bankNameUrdu: bankNameUrdu || '',
          accountNumber: accountNumber || '',
          accountTitle: accountTitle || '',
          branchName: branchName || '',
          openingBalance: openingBalance || 0,
          isActive: true,
          isAdminManaged: true,
          addedByAdmin: true
        });

        await bank.save();
        console.log('Bank created with ID:', bank._id, 'isAdminManaged:', bank.isAdminManaged);
        createdBanks.push(bank);
      }
    }
    
    console.log('Total banks created/updated:', createdBanks.length);

    res.json({
      message: 'Bank created for all companies successfully',
      banks: createdBanks
    });
  } catch (error) {
    console.error('Admin create bank error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update bank (updates for all companies with same bank)
router.put('/admin/:bankId', verifyAdmin, async (req, res) => {
  try {
    const {
      bankName,
      bankNameUrdu,
      accountNumber,
      accountTitle,
      branchName,
      openingBalance,
      isActive
    } = req.body;

    // Find the bank to get its details
    const templateBank = await Bank.findById(req.params.bankId);
    if (!templateBank || !templateBank.isAdminManaged) {
      return res.status(404).json({ message: 'Admin-managed bank not found' });
    }

    // Update all banks with same admin-managed identifier
    // We'll use bankName + accountNumber as identifier
    const updateResult = await Bank.updateMany(
      {
        isAdminManaged: true,
        bankName: templateBank.bankName,
        accountNumber: templateBank.accountNumber
      },
      {
        $set: {
          bankName: bankName !== undefined ? bankName : templateBank.bankName,
          bankNameUrdu: bankNameUrdu !== undefined ? bankNameUrdu : templateBank.bankNameUrdu,
          accountNumber: accountNumber !== undefined ? accountNumber : templateBank.accountNumber,
          accountTitle: accountTitle !== undefined ? accountTitle : templateBank.accountTitle,
          branchName: branchName !== undefined ? branchName : templateBank.branchName,
          openingBalance: openingBalance !== undefined ? openingBalance : templateBank.openingBalance,
          isActive: isActive !== undefined ? isActive : templateBank.isActive
        }
      }
    );

    res.json({
      message: 'Bank updated for all companies successfully',
      updatedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Admin update bank error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete bank (deletes from all companies)
router.delete('/admin/:bankId', verifyAdmin, async (req, res) => {
  try {
    const templateBank = await Bank.findById(req.params.bankId);
    if (!templateBank || !templateBank.isAdminManaged) {
      return res.status(404).json({ message: 'Admin-managed bank not found' });
    }

    // Delete all banks with same admin-managed identifier
    const deleteResult = await Bank.deleteMany({
      isAdminManaged: true,
      bankName: templateBank.bankName,
      accountNumber: templateBank.accountNumber
    });

    // Also delete all transactions for these banks
    const bankIds = await Bank.find({
      isAdminManaged: true,
      bankName: templateBank.bankName,
      accountNumber: templateBank.accountNumber
    }).select('_id');
    
    await BankTransaction.deleteMany({
      bankId: { $in: bankIds.map(b => b._id) }
    });

    res.json({
      message: 'Bank deleted from all companies successfully',
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Admin delete bank error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

