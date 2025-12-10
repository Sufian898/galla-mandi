const express = require('express');
const router = express.Router();
const ExpenseLedger = require('../models/ExpenseLedger');
const PaymentMethod = require('../models/PaymentMethod');
const BankTransaction = require('../models/BankTransaction');
const { verifyCompany } = require('../middleware/auth');

// Company: Get all expense ledger entries
router.get('/company/all', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const expenses = await ExpenseLedger.find({ companyId })
      .sort({ date: -1, createdAt: -1 });
    res.json({ expenses });
  } catch (error) {
    console.error('Get expense ledger error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Get single expense entry
router.get('/company/:expenseId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const expense = await ExpenseLedger.findOne({ _id: req.params.expenseId, companyId });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense entry not found' });
    }
    
    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Create new expense entry
router.post('/company/create', verifyCompany, async (req, res) => {
  try {
    const {
      date,
      travellingExpense,
      refreshment,
      cargo,
      salaryExpense,
      paymentMethod,
      description,
      descriptionUrdu
    } = req.body;
    const companyId = req.user.id;

    const totalAmount = (travellingExpense || 0) + (refreshment || 0) + (cargo || 0) + (salaryExpense || 0);

    const expense = new ExpenseLedger({
      companyId,
      date: date ? new Date(date) : new Date(),
      travellingExpense: travellingExpense || 0,
      refreshment: refreshment || 0,
      cargo: cargo || 0,
      salaryExpense: salaryExpense || 0,
      paymentMethod: paymentMethod || '',
      description: description || '',
      descriptionUrdu: descriptionUrdu || ''
    });

    await expense.save();

    // If payment method is selected and total amount > 0, create bank transaction (withdrawal)
    if (paymentMethod && totalAmount > 0) {
      try {
        // Find the payment method to get its details
        const paymentMethodDoc = await PaymentMethod.findOne({
          $or: [
            { name: paymentMethod },
            { nameUrdu: paymentMethod }
          ],
          isActive: true
        });

        if (paymentMethodDoc) {
          // Get all expenses for this payment method to calculate balance
          const allExpenses = await ExpenseLedger.find({ 
            companyId,
            paymentMethod: paymentMethod
          }).sort({ date: 1, createdAt: 1 });

          // Get all recoveries for this payment method (deposits)
          const Recovery = require('../models/Recovery');
          const allRecoveries = await Recovery.find({
            companyId,
            paymentMethod: paymentMethod
          }).sort({ date: 1, createdAt: 1 });

          // Calculate current balance: deposits - withdrawals
          let currentBalance = 0;
          allRecoveries.forEach(recovery => {
            currentBalance += (recovery.recoveryAmount || 0);
          });
          allExpenses.forEach(exp => {
            const expTotal = (exp.travellingExpense || 0) + (exp.refreshment || 0) + 
                           (exp.cargo || 0) + (exp.salaryExpense || 0);
            currentBalance -= expTotal;
          });

          // Create withdrawal transaction (using payment method as identifier)
          const bankTransaction = new BankTransaction({
            companyId,
            bankId: null, // No specific bank, using payment method
            expenseId: expense._id,
            date: date ? new Date(date) : new Date(),
            type: 'withdraw',
            amount: totalAmount,
            paymentMethod: paymentMethod,
            description: `Expense - ${descriptionUrdu || description || 'اخراجات'}`,
            descriptionUrdu: `اخراجات - ${descriptionUrdu || description || 'Expense'}`,
            balanceAfter: currentBalance - totalAmount
          });

          await bankTransaction.save();
        }
      } catch (bankError) {
        console.error('Create bank transaction for expense error:', bankError);
        // Don't fail expense creation if bank transaction fails
      }
    }

    res.json({
      message: 'Expense entry created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Update expense entry
router.put('/company/:expenseId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const expense = await ExpenseLedger.findOne({ _id: req.params.expenseId, companyId });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense entry not found' });
    }

    const {
      date,
      travellingExpense,
      refreshment,
      cargo,
      salaryExpense,
      paymentMethod,
      description,
      descriptionUrdu
    } = req.body;

    const oldTotal = (expense.travellingExpense || 0) + (expense.refreshment || 0) + 
                     (expense.cargo || 0) + (expense.salaryExpense || 0);
    const oldPaymentMethod = expense.paymentMethod;

    if (date !== undefined) expense.date = new Date(date);
    if (travellingExpense !== undefined) expense.travellingExpense = travellingExpense;
    if (refreshment !== undefined) expense.refreshment = refreshment;
    if (cargo !== undefined) expense.cargo = cargo;
    if (salaryExpense !== undefined) expense.salaryExpense = salaryExpense;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (description !== undefined) expense.description = description;
    if (descriptionUrdu !== undefined) expense.descriptionUrdu = descriptionUrdu;

    await expense.save();

    // Update bank transaction if payment method or amount changed
    const newTotal = (expense.travellingExpense || 0) + (expense.refreshment || 0) + 
                     (expense.cargo || 0) + (expense.salaryExpense || 0);
    
    if (paymentMethod && newTotal > 0 && (oldPaymentMethod !== paymentMethod || oldTotal !== newTotal)) {
      try {
        // Delete old transaction if payment method changed
        if (oldPaymentMethod && oldPaymentMethod !== paymentMethod) {
          await BankTransaction.findOneAndDelete({ expenseId: expense._id });
        }

        // Create/update bank transaction
        const paymentMethodDoc = await PaymentMethod.findOne({
          $or: [
            { name: paymentMethod },
            { nameUrdu: paymentMethod }
          ],
          isActive: true
        });

        if (paymentMethodDoc) {
          // Get all expenses and recoveries for balance calculation
          const allExpenses = await ExpenseLedger.find({ 
            companyId,
            paymentMethod: paymentMethod
          }).sort({ date: 1, createdAt: 1 });

          const Recovery = require('../models/Recovery');
          const allRecoveries = await Recovery.find({
            companyId,
            paymentMethod: paymentMethod
          }).sort({ date: 1, createdAt: 1 });

          let currentBalance = 0;
          allRecoveries.forEach(recovery => {
            currentBalance += (recovery.recoveryAmount || 0);
          });
          allExpenses.forEach(exp => {
            if (exp._id.toString() !== expense._id.toString()) {
              const expTotal = (exp.travellingExpense || 0) + (exp.refreshment || 0) + 
                             (exp.cargo || 0) + (exp.salaryExpense || 0);
              currentBalance -= expTotal;
            }
          });

          // Update or create transaction
          const existingTransaction = await BankTransaction.findOne({ expenseId: expense._id });
          if (existingTransaction) {
            existingTransaction.amount = newTotal;
            existingTransaction.paymentMethod = paymentMethod;
            existingTransaction.description = `Expense - ${expense.descriptionUrdu || expense.description || 'اخراجات'}`;
            existingTransaction.descriptionUrdu = `اخراجات - ${expense.descriptionUrdu || expense.description || 'Expense'}`;
            existingTransaction.balanceAfter = currentBalance - newTotal;
            await existingTransaction.save();
          } else {
            const bankTransaction = new BankTransaction({
              companyId,
              bankId: null,
              expenseId: expense._id,
              date: expense.date,
              type: 'withdraw',
              amount: newTotal,
              paymentMethod: paymentMethod,
              description: `Expense - ${expense.descriptionUrdu || expense.description || 'اخراجات'}`,
              descriptionUrdu: `اخراجات - ${expense.descriptionUrdu || expense.description || 'Expense'}`,
              balanceAfter: currentBalance - newTotal
            });
            await bankTransaction.save();
          }
        }
      } catch (bankError) {
        console.error('Update bank transaction for expense error:', bankError);
      }
    }

    res.json({
      message: 'Expense entry updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Company: Delete expense entry
router.delete('/company/:expenseId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const expense = await ExpenseLedger.findOneAndDelete({ _id: req.params.expenseId, companyId });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense entry not found' });
    }

    // Delete associated bank transaction
    await BankTransaction.findOneAndDelete({ expenseId: expense._id });

    res.json({ message: 'Expense entry deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


