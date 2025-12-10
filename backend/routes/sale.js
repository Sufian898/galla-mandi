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
      customerPartyId,
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
      customerPartyId: customerPartyId || null,
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

    // Create ledger transactions if customer is selected
    if (customerPartyId && totalAmount > 0) {
      try {
        const LedgerTransaction = require('../models/LedgerTransaction');
        const LedgerParty = require('../models/LedgerParty');

        // Verify party exists and belongs to company
        const party = await LedgerParty.findOne({ _id: customerPartyId, companyId });
        if (party) {
          const saleSerial = finalSerialNumber || sale._id.toString().slice(-6);
          const saleDescription = `سیل #${saleSerial}`;

          // 1. Debit transaction: Total sale amount (customer owes this amount)
          if (totalAmount > 0) {
            const debitTx = new LedgerTransaction({
              companyId,
              partyId: customerPartyId,
              saleId: sale._id,
              date: sale.date,
              description: saleDescription + ' (سیل)',
              type: 'debit', // Debit increases customer balance (they owe more)
              amount: totalAmount
            });
            await debitTx.save();
          }

          // 2. Credit transaction: Amount paid (reduces customer balance)
          if (amountPaid > 0) {
            const creditTx = new LedgerTransaction({
              companyId,
              partyId: customerPartyId,
              saleId: sale._id,
              date: sale.date,
              description: saleDescription + ' (ادائیگی)',
              type: 'credit', // Credit reduces customer balance
              amount: amountPaid
            });
            await creditTx.save();
          }

          // Recalculate party balance
          const transactions = await LedgerTransaction.find({ companyId, partyId: customerPartyId })
            .sort({ date: 1, createdAt: 1 });

          let balance = party.openingBalance || 0;
          for (const tx of transactions) {
            if (tx.type === 'debit') {
              balance += tx.amount;
            } else if (tx.type === 'credit') {
              balance -= tx.amount;
            }
            tx.balanceAfter = balance;
            await tx.save();
          }

          party.currentBalance = balance;
          await party.save();
        }
      } catch (ledgerError) {
        console.error('Create sale ledger transaction error:', ledgerError);
        // Don't fail the sale creation if ledger transaction fails
      }
    }

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
      customerPartyId,
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

    // Store old values for ledger update
    const oldCustomerPartyId = sale.customerPartyId;
    const oldTotalAmount = sale.totalAmount || 0;
    const oldAmountPaid = sale.amountPaid || 0;
    const oldDate = sale.date;

    if (supplierName !== undefined) sale.supplierName = supplierName;
    if (supplierNameUrdu !== undefined) sale.supplierNameUrdu = supplierNameUrdu;
    if (supplierVehicleNumber !== undefined) sale.supplierVehicleNumber = supplierVehicleNumber;
    if (sellerName !== undefined) sale.sellerName = sellerName;
    if (sellerNameUrdu !== undefined) sale.sellerNameUrdu = sellerNameUrdu;
    if (sellerNumber !== undefined) sale.sellerNumber = sellerNumber;
    if (customerPartyId !== undefined) sale.customerPartyId = customerPartyId || null;
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

    // Update ledger transactions if customer or amounts changed
    const newCustomerPartyId = sale.customerPartyId;
    const newTotalAmount = sale.totalAmount || 0;
    const newAmountPaid = sale.amountPaid || 0;
    const newDate = sale.date;

    const customerChanged = oldCustomerPartyId?.toString() !== newCustomerPartyId?.toString();
    const amountsChanged = oldTotalAmount !== newTotalAmount || oldAmountPaid !== newAmountPaid;
    const dateChanged = oldDate?.getTime() !== newDate?.getTime();

    if (customerChanged || amountsChanged || dateChanged) {
      try {
        const LedgerTransaction = require('../models/LedgerTransaction');
        const LedgerParty = require('../models/LedgerParty');

        // Delete old transactions if customer changed or amounts changed
        if (customerChanged || amountsChanged) {
          if (oldCustomerPartyId) {
            const oldTransactions = await LedgerTransaction.find({ 
              companyId, 
              saleId: sale._id 
            });
            
            if (oldTransactions.length > 0) {
              await LedgerTransaction.deleteMany({ companyId, saleId: sale._id });
              
              // Recalculate old party balance
              const oldParty = await LedgerParty.findOne({ _id: oldCustomerPartyId, companyId });
              if (oldParty) {
                const remainingTransactions = await LedgerTransaction.find({ 
                  companyId, 
                  partyId: oldCustomerPartyId 
                }).sort({ date: 1, createdAt: 1 });

                let balance = oldParty.openingBalance || 0;
                for (const tx of remainingTransactions) {
                  if (tx.type === 'debit') {
                    balance += tx.amount;
                  } else if (tx.type === 'credit') {
                    balance -= tx.amount;
                  }
                  tx.balanceAfter = balance;
                  await tx.save();
                }

                oldParty.currentBalance = balance;
                await oldParty.save();
              }
            }
          }
        }

        // Create new transactions if customer is selected
        if (newCustomerPartyId && newTotalAmount > 0) {
          const party = await LedgerParty.findOne({ _id: newCustomerPartyId, companyId });
          if (party) {
            const saleSerial = sale.serialNumber || sale._id.toString().slice(-6);
            const saleDescription = `سیل #${saleSerial}`;

            // 1. Debit transaction: Total sale amount
            if (newTotalAmount > 0) {
              const debitTx = new LedgerTransaction({
                companyId,
                partyId: newCustomerPartyId,
                saleId: sale._id,
                date: newDate,
                description: saleDescription + ' (سیل)',
                type: 'debit',
                amount: newTotalAmount
              });
              await debitTx.save();
            }

            // 2. Credit transaction: Amount paid
            if (newAmountPaid > 0) {
              const creditTx = new LedgerTransaction({
                companyId,
                partyId: newCustomerPartyId,
                saleId: sale._id,
                date: newDate,
                description: saleDescription + ' (ادائیگی)',
                type: 'credit',
                amount: newAmountPaid
              });
              await creditTx.save();
            }

            // Recalculate party balance
            const transactions = await LedgerTransaction.find({ 
              companyId, 
              partyId: newCustomerPartyId 
            }).sort({ date: 1, createdAt: 1 });

            let balance = party.openingBalance || 0;
            for (const tx of transactions) {
              if (tx.type === 'debit') {
                balance += tx.amount;
              } else if (tx.type === 'credit') {
                balance -= tx.amount;
              }
              tx.balanceAfter = balance;
              await tx.save();
            }

            party.currentBalance = balance;
            await party.save();
          }
        } else if (dateChanged && newCustomerPartyId) {
          // Only date changed, update transaction dates
          const transactions = await LedgerTransaction.find({ 
            companyId, 
            saleId: sale._id 
          });
          
          for (const tx of transactions) {
            tx.date = newDate;
            await tx.save();
          }

          // Recalculate balance
          const party = await LedgerParty.findOne({ _id: newCustomerPartyId, companyId });
          if (party) {
            const transactions = await LedgerTransaction.find({ 
              companyId, 
              partyId: newCustomerPartyId 
            }).sort({ date: 1, createdAt: 1 });

            let balance = party.openingBalance || 0;
            for (const tx of transactions) {
              if (tx.type === 'debit') {
                balance += tx.amount;
              } else if (tx.type === 'credit') {
                balance -= tx.amount;
              }
              tx.balanceAfter = balance;
              await tx.save();
            }

            party.currentBalance = balance;
            await party.save();
          }
        }
      } catch (ledgerError) {
        console.error('Update sale ledger transaction error:', ledgerError);
        // Don't fail the sale update if ledger transaction fails
      }
    }

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
    const sale = await Sale.findOne({ _id: req.params.saleId, companyId });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Delete related ledger transactions
    try {
      const LedgerTransaction = require('../models/LedgerTransaction');
      const LedgerParty = require('../models/LedgerParty');

      // Find all transactions linked to this sale
      const transactions = await LedgerTransaction.find({ 
        companyId, 
        saleId: sale._id 
      });

      if (transactions.length > 0) {
        const partyIds = [...new Set(transactions.map(tx => tx.partyId.toString()))];
        
        // Delete all transactions linked to this sale
        await LedgerTransaction.deleteMany({ companyId, saleId: sale._id });

        // Recalculate balances for affected parties
        for (const partyId of partyIds) {
          const party = await LedgerParty.findOne({ _id: partyId, companyId });
          if (party) {
            const remainingTransactions = await LedgerTransaction.find({ 
              companyId, 
              partyId: partyId 
            }).sort({ date: 1, createdAt: 1 });

            let balance = party.openingBalance || 0;
            for (const tx of remainingTransactions) {
              if (tx.type === 'debit') {
                balance += tx.amount;
              } else if (tx.type === 'credit') {
                balance -= tx.amount;
              }
              tx.balanceAfter = balance;
              await tx.save();
            }

            party.currentBalance = balance;
            await party.save();
          }
        }
      }
    } catch (ledgerError) {
      console.error('Delete sale ledger transactions error:', ledgerError);
      // Continue with sale deletion even if ledger update fails
    }

    // Delete the sale
    await Sale.findByIdAndDelete(sale._id);

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

