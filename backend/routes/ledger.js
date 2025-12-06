const express = require('express');
const router = express.Router();
const LedgerParty = require('../models/LedgerParty');
const LedgerTransaction = require('../models/LedgerTransaction');
const { verifyCompany } = require('../middleware/auth');

// Create ledger party (customer / supplier)
router.post('/parties', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { name, nameUrdu, type, phone, address, openingBalance, balanceType, notes } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    // Calculate balance: receivable = positive, payable = negative
    const balance = openingBalance || 0;
    const finalBalance = balanceType === 'payable' ? -Math.abs(balance) : Math.abs(balance);

    const party = new LedgerParty({
      companyId,
      name,
      nameUrdu: nameUrdu || '',
      type,
      phone: phone || '',
      address: address || '',
      openingBalance: finalBalance,
      balanceType: balanceType || 'receivable',
      currentBalance: finalBalance,
      notes: notes || ''
    });

    await party.save();

    res.json({ message: 'Ledger party created successfully', party });
  } catch (error) {
    console.error('Create ledger party error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all parties for company (optionally filtered by type)
router.get('/parties', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { type } = req.query;

    const query = { companyId };
    if (type && ['customer', 'supplier'].includes(type)) {
      query.type = type;
    }

    const parties = await LedgerParty.find(query).sort({ name: 1 });
    res.json({ parties });
  } catch (error) {
    console.error('Get ledger parties error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update party
router.put('/parties/:partyId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { partyId } = req.params;
    const { name, nameUrdu, type, phone, address, openingBalance, balanceType, notes } = req.body;

    const party = await LedgerParty.findOne({ _id: partyId, companyId });
    if (!party) {
      return res.status(404).json({ message: 'Ledger party not found' });
    }

    if (name !== undefined) party.name = name;
    if (nameUrdu !== undefined) party.nameUrdu = nameUrdu;
    if (type !== undefined && ['customer', 'supplier'].includes(type)) party.type = type;
    if (phone !== undefined) party.phone = phone;
    if (address !== undefined) party.address = address;
    if (balanceType !== undefined && ['receivable', 'payable'].includes(balanceType)) party.balanceType = balanceType;
    if (notes !== undefined) party.notes = notes;

    // If opening balance or balanceType changed, recalculate
    if (openingBalance !== undefined && typeof openingBalance === 'number') {
      const balance = openingBalance;
      const finalBalance = (balanceType || party.balanceType) === 'payable' ? -Math.abs(balance) : Math.abs(balance);
      const diff = finalBalance - (party.openingBalance || 0);
      party.openingBalance = finalBalance;
      party.currentBalance = (party.currentBalance || 0) + diff;
    } else if (balanceType !== undefined && ['receivable', 'payable'].includes(balanceType)) {
      // If only balanceType changed, recalculate opening balance
      const balance = Math.abs(party.openingBalance || 0);
      const finalBalance = balanceType === 'payable' ? -balance : balance;
      const diff = finalBalance - (party.openingBalance || 0);
      party.openingBalance = finalBalance;
      party.currentBalance = (party.currentBalance || 0) + diff;
    }

    await party.save();

    res.json({ message: 'Ledger party updated successfully', party });
  } catch (error) {
    console.error('Update ledger party error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete party (and its transactions)
router.delete('/parties/:partyId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { partyId } = req.params;

    const party = await LedgerParty.findOneAndDelete({ _id: partyId, companyId });
    if (!party) {
      return res.status(404).json({ message: 'Ledger party not found' });
    }

    await LedgerTransaction.deleteMany({ partyId: party._id, companyId });

    res.json({ message: 'Ledger party and its transactions deleted successfully' });
  } catch (error) {
    console.error('Delete ledger party error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transactions for a party
router.get('/parties/:partyId/transactions', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { partyId } = req.params;

    const party = await LedgerParty.findOne({ _id: partyId, companyId });
    if (!party) {
      return res.status(404).json({ message: 'Ledger party not found' });
    }

    const transactions = await LedgerTransaction.find({ companyId, partyId })
      .sort({ date: 1, createdAt: 1 });

    res.json({ party, transactions });
  } catch (error) {
    console.error('Get ledger transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper: recalc currentBalance and balanceAfter for all transactions of a party
const recalcPartyBalances = async (companyId, partyId) => {
  const party = await LedgerParty.findOne({ _id: partyId, companyId });
  if (!party) return;

  const transactions = await LedgerTransaction.find({ companyId, partyId })
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
};

// Create transaction
router.post('/parties/:partyId/transactions', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { partyId } = req.params;
    const { date, description, type, amount, billId } = req.body;

    if (!type || !['debit', 'credit'].includes(type) || typeof amount !== 'number') {
      return res.status(400).json({ message: 'Type (debit/credit) and numeric amount are required' });
    }

    const party = await LedgerParty.findOne({ _id: partyId, companyId });
    if (!party) {
      return res.status(404).json({ message: 'Ledger party not found' });
    }

    const tx = new LedgerTransaction({
      companyId,
      partyId,
      billId: billId || null,
      date: date ? new Date(date) : new Date(),
      description: description || '',
      type,
      amount
    });

    await tx.save();
    await recalcPartyBalances(companyId, partyId);

    res.json({ message: 'Transaction created successfully', transaction: tx });
  } catch (error) {
    console.error('Create ledger transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction
router.put('/transactions/:transactionId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { transactionId } = req.params;
    const { date, description, type, amount } = req.body;

    const tx = await LedgerTransaction.findOne({ _id: transactionId, companyId });
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (date !== undefined) tx.date = new Date(date);
    if (description !== undefined) tx.description = description;
    if (type !== undefined && ['debit', 'credit'].includes(type)) tx.type = type;
    if (amount !== undefined && typeof amount === 'number') tx.amount = amount;

    await tx.save();
    await recalcPartyBalances(companyId, tx.partyId);

    res.json({ message: 'Transaction updated successfully', transaction: tx });
  } catch (error) {
    console.error('Update ledger transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete transaction
router.delete('/transactions/:transactionId', verifyCompany, async (req, res) => {
  try {
    const companyId = req.user.id;
    const { transactionId } = req.params;

    const tx = await LedgerTransaction.findOneAndDelete({ _id: transactionId, companyId });
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await recalcPartyBalances(companyId, tx.partyId);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete ledger transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


