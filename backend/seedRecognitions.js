const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recognition = require('./models/Recognition');

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0';

const dummyRecognitions = [
  {
    title: "Best Business Solution 2024",
    titleUrdu: "بہترین کاروباری حل 2024",
    description: "Awarded for excellence in providing innovative business solutions for commission agents.",
    descriptionUrdu: "کمیشن ایجنٹس کے لیے جدید کاروباری حل فراہم کرنے میں بہترین کارکردگی کے لیے ایوارڈ",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    year: "2024",
    category: "Business Excellence",
    categoryUrdu: "کاروباری بہترین",
    order: 1,
    isActive: true
  },
  {
    title: "Digital Innovation Award",
    titleUrdu: "ڈیجیٹل انوویشن ایوارڈ",
    description: "Recognized for outstanding contribution to digital transformation in traditional markets.",
    descriptionUrdu: "روایتی مارکیٹوں میں ڈیجیٹل تبدیلی میں نمایاں تعاون کے لیے تسلیم شدہ",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
    year: "2023",
    category: "Innovation",
    categoryUrdu: "انوویشن",
    order: 2,
    isActive: true
  },
  {
    title: "Customer Satisfaction Excellence",
    titleUrdu: "کسٹمر کی اطمینان کی بہترین کارکردگی",
    description: "Achieved highest customer satisfaction ratings in the industry for three consecutive years.",
    descriptionUrdu: "تین سال مسلسل صنعت میں سب سے زیادہ کسٹمر اطمینان کی درجہ بندی حاصل کی",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    year: "2023",
    category: "Customer Service",
    categoryUrdu: "کسٹمر سروس",
    order: 3,
    isActive: true
  },
  {
    title: "Technology Leadership",
    titleUrdu: "ٹیکنالوجی کی قیادت",
    description: "Leading the way in technology adoption for traditional business sectors.",
    descriptionUrdu: "روایتی کاروباری شعبوں میں ٹیکنالوجی کے استعمال میں قیادت",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
    year: "2022",
    category: "Technology",
    categoryUrdu: "ٹیکنالوجی",
    order: 4,
    isActive: true
  },
  {
    title: "Regional Business Impact",
    titleUrdu: "علاقائی کاروباری اثر",
    description: "Recognized for significant positive impact on local business communities.",
    descriptionUrdu: "مقامی کاروباری کمیونٹیز پر نمایاں مثبت اثر کے لیے تسلیم شدہ",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    year: "2022",
    category: "Community Impact",
    categoryUrdu: "کمیونٹی اثر",
    order: 5,
    isActive: true
  },
  {
    title: "Sustainable Business Practices",
    titleUrdu: "پائیدار کاروباری طریقے",
    description: "Awarded for commitment to sustainable and ethical business practices.",
    descriptionUrdu: "پائیدار اور اخلاقی کاروباری طریقوں کے عزم کے لیے ایوارڈ",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
    year: "2021",
    category: "Sustainability",
    categoryUrdu: "پائیداری",
    order: 6,
    isActive: true
  }
];

async function seedRecognitions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');

    // Clear existing recognitions first
    await Recognition.deleteMany({});
    console.log('Cleared existing recognitions');

    // Insert dummy recognitions
    const inserted = await Recognition.insertMany(dummyRecognitions);
    console.log(`✅ Successfully added ${inserted.length} recognitions with images!`);

    // Display added recognitions
    inserted.forEach((recognition, index) => {
      console.log(`${index + 1}. ${recognition.title} - ${recognition.year}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding recognitions:', error);
    process.exit(1);
  }
}

seedRecognitions();

