const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TeamMember = require('./models/TeamMember');

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0';

const dummyTeamMembers = [
  {
    name: "Ahmed Ali",
    nameUrdu: "احمد علی",
    title: "Chief Executive Officer",
    titleUrdu: "چیف ایگزیکٹو آفیسر",
    image: "https://i.pravatar.cc/300?img=12",
    bio: "Experienced leader with 15+ years in business management",
    bioUrdu: "15 سال سے زیادہ کاروباری انتظام کا تجربہ رکھنے والا تجربہ کار رہنما",
    email: "ahmed.ali@example.com",
    phone: "+92 300 1234567",
    order: 1,
    isActive: true
  },
  {
    name: "Fatima Khan",
    nameUrdu: "فاطمہ خان",
    title: "Project Manager",
    titleUrdu: "پروجیکٹ مینیجر",
    image: "https://i.pravatar.cc/300?img=47",
    bio: "Expert in project planning and team coordination",
    bioUrdu: "پروجیکٹ کی منصوبہ بندی اور ٹیم کی ہم آہنگی میں ماہر",
    email: "fatima.khan@example.com",
    phone: "+92 301 2345678",
    order: 2,
    isActive: true
  },
  {
    name: "Hassan Raza",
    nameUrdu: "حسن رضا",
    title: "Software Engineer",
    titleUrdu: "سافٹ ویئر انجینئر",
    image: "https://i.pravatar.cc/300?img=33",
    bio: "Full-stack developer specializing in modern web technologies",
    bioUrdu: "جدید ویب ٹیکنالوجیز میں مہارت رکھنے والا فول اسٹیک ڈویلپر",
    email: "hassan.raza@example.com",
    phone: "+92 302 3456789",
    order: 3,
    isActive: true
  },
  {
    name: "Ayesha Malik",
    nameUrdu: "عائشہ ملک",
    title: "UX Designer",
    titleUrdu: "یو ایکس ڈیزائنر",
    image: "https://i.pravatar.cc/300?img=45",
    bio: "Creative designer focused on user experience and interface design",
    bioUrdu: "صارف کے تجربے اور انٹرفیس ڈیزائن پر توجہ دینے والا تخلیقی ڈیزائنر",
    email: "ayesha.malik@example.com",
    phone: "+92 303 4567890",
    order: 4,
    isActive: true
  },
  {
    name: "Usman Sheikh",
    nameUrdu: "عثمان شیخ",
    title: "Data Analyst",
    titleUrdu: "ڈیٹا تجزیہ کار",
    image: "https://i.pravatar.cc/300?img=15",
    bio: "Analytics expert with expertise in data visualization and insights",
    bioUrdu: "ڈیٹا کی تصویر کشی اور بصیرت میں مہارت رکھنے والا تجزیاتی ماہر",
    email: "usman.sheikh@example.com",
    phone: "+92 304 5678901",
    order: 5,
    isActive: true
  },
  {
    name: "Zainab Abbas",
    nameUrdu: "زینب عباس",
    title: "Marketing Specialist",
    titleUrdu: "مارکیٹنگ ماہر",
    image: "https://i.pravatar.cc/300?img=52",
    bio: "Digital marketing expert with strong social media presence",
    bioUrdu: "مضبوط سوشل میڈیا موجودگی کے ساتھ ڈیجیٹل مارکیٹنگ ماہر",
    email: "zainab.abbas@example.com",
    phone: "+92 305 6789012",
    order: 6,
    isActive: true
  },
  {
    name: "Bilal Ahmed",
    nameUrdu: "بلال احمد",
    title: "Quality Assurance",
    titleUrdu: "معیار کی ضمانت",
    image: "https://i.pravatar.cc/300?img=27",
    bio: "QA engineer ensuring product quality and reliability",
    bioUrdu: "مصنوعات کے معیار اور اعتماد کو یقینی بنانے والا QA انجینئر",
    email: "bilal.ahmed@example.com",
    phone: "+92 306 7890123",
    order: 7,
    isActive: true
  },
  {
    name: "Sana Iqbal",
    nameUrdu: "ثناء اقبال",
    title: "Content Strategist",
    titleUrdu: "مواد کی حکمت عملی کار",
    image: "https://i.pravatar.cc/300?img=63",
    bio: "Content creator and strategist with expertise in brand storytelling",
    bioUrdu: "برانڈ کہانی سنانے میں مہارت رکھنے والا مواد تخلیق کار اور حکمت عملی کار",
    email: "sana.iqbal@example.com",
    phone: "+92 307 8901234",
    order: 8,
    isActive: true
  }
];

async function seedTeamMembers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');

    // Clear existing team members first
    await TeamMember.deleteMany({});
    console.log('Cleared existing team members');

    // Insert dummy team members
    const inserted = await TeamMember.insertMany(dummyTeamMembers);
    console.log(`✅ Successfully added ${inserted.length} team members with images!`);

    // Display added members
    inserted.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} - ${member.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding team members:', error);
    process.exit(1);
  }
}

seedTeamMembers();

