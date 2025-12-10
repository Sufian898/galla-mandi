const mongoose = require('mongoose');
const Bank = require('../models/Bank');

// Update this with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

async function updateAdminBanks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all banks that don't have isAdminManaged flag but should be admin-managed
    // We'll check if they have addedByAdmin flag or if they were created by admin
    const banks = await Bank.find({
      $or: [
        { isAdminManaged: { $exists: false } },
        { addedByAdmin: true, isAdminManaged: { $ne: true } }
      ]
    });

    console.log(`Found ${banks.length} banks to update`);

    // Update banks that have addedByAdmin flag
    const result1 = await Bank.updateMany(
      { addedByAdmin: true, isAdminManaged: { $ne: true } },
      { $set: { isAdminManaged: true } }
    );
    console.log(`Updated ${result1.modifiedCount} banks with addedByAdmin flag`);

    // If you want to mark all existing banks as admin-managed (uncomment if needed)
    // const result2 = await Bank.updateMany(
    //   { isAdminManaged: { $exists: false } },
    //   { $set: { isAdminManaged: false } } // Set to false for company-created banks
    // );
    // console.log(`Updated ${result2.modifiedCount} banks without flag`);

    console.log('Update complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating banks:', error);
    process.exit(1);
  }
}

updateAdminBanks();

