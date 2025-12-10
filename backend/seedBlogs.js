const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('./models/Blog');

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://sufianali122nb:1234sufi@cluster0.0qnf0nx.mongodb.net/gallamandi?appName=Cluster0';

const dummyBlogs = [
  {
    title: "Innovative Solutions for Every Business Success",
    titleUrdu: "ہر کاروباری کامیابی کے لیے جدید حل",
    excerpt: "Discover how innovative solutions can transform your business and drive sustainable growth in today's competitive market.",
    excerptUrdu: "جانیں کہ کیسے جدید حل آپ کے کاروبار کو تبدیل کر سکتے ہیں اور آج کی مسابقتی مارکیٹ میں پائیدار ترقی کو فروغ دے سکتے ہیں۔",
    content: `
      <h2>The Importance of Innovation</h2>
      <p>Innovation drives growth, improves efficiency, and creates competitive advantages. It's about finding new ways to solve problems, meet customer needs, and create value.</p>
      
      <h2>Key Strategies for Innovation</h2>
      <ul>
        <li>Foster a culture of creativity and experimentation</li>
        <li>Invest in research and development</li>
        <li>Embrace new technologies and methodologies</li>
        <li>Listen to customer feedback and market trends</li>
        <li>Encourage collaboration across teams</li>
      </ul>
      
      <h2>Measuring Success</h2>
      <p>Successful innovation requires clear metrics and KPIs. Track your progress, learn from failures, and continuously refine your approach.</p>
    `,
    contentUrdu: `
      <h2>جدت کی اہمیت</h2>
      <p>جدت ترقی کو فروغ دیتی ہے، کارکردگی کو بہتر بناتی ہے، اور مسابقتی فوائد پیدا کرتی ہے۔ یہ مسائل کو حل کرنے، کسٹمر کی ضروریات کو پورا کرنے، اور قدر پیدا کرنے کے نئے طریقے تلاش کرنے کے بارے میں ہے۔</p>
      
      <h2>جدت کے لیے کلیدی حکمت عملی</h2>
      <ul>
        <li>تخلیقی صلاحیت اور تجربات کی ثقافت کو فروغ دیں</li>
        <li>تحقیق اور ترقی میں سرمایہ کاری کریں</li>
        <li>نئی ٹیکنالوجیز اور طریقوں کو اپنائیں</li>
        <li>کسٹمر کی رائے اور مارکیٹ کے رجحانات سنیں</li>
        <li>ٹیموں کے درمیان تعاون کو فروغ دیں</li>
      </ul>
    `,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    author: "Ahmed Ali",
    authorUrdu: "احمد علی",
    category: "Business",
    categoryUrdu: "کاروبار",
    tags: ["business", "innovation", "growth"],
    publishedDate: new Date("2024-02-28"),
    order: 1,
    isPublished: true
  },
  {
    title: "Harnessing Digital Transformation: A Roadmap for Businesses",
    titleUrdu: "ڈیجیٹل تبدیلی کو بروئے کار لانا: کاروباروں کے لیے روڈ میپ",
    excerpt: "Learn the essential steps to digital transformation and how it can revolutionize your business operations and customer experience.",
    excerptUrdu: "ڈیجیٹل تبدیلی کے ضروری مراحل سیکھیں اور یہ کیسے آپ کے کاروباری آپریشنز اور کسٹمر کے تجربے میں انقلاب لا سکتا ہے۔",
    content: `
      <h2>Understanding Digital Transformation</h2>
      <p>Digital transformation goes beyond simply adopting new technologies. It's about fundamentally rethinking how your business operates and delivers value to customers.</p>
      
      <h2>The Roadmap</h2>
      <ol>
        <li>Assess your current state and identify gaps</li>
        <li>Define your vision and objectives</li>
        <li>Develop a strategic plan</li>
        <li>Implement changes incrementally</li>
        <li>Monitor progress and adjust as needed</li>
      </ol>
      
      <h2>Common Challenges</h2>
      <p>Resistance to change, lack of expertise, and budget constraints are common challenges. Address these proactively to ensure success.</p>
    `,
    contentUrdu: `
      <h2>ڈیجیٹل تبدیلی کو سمجھنا</h2>
      <p>ڈیجیٹل تبدیلی صرف نئی ٹیکنالوجیز اپنانے سے کہیں زیادہ ہے۔ یہ بنیادی طور پر یہ سوچنے کے بارے میں ہے کہ آپ کا کاروبار کیسے کام کرتا ہے اور کسٹمرز کو قدر فراہم کرتا ہے۔</p>
      
      <h2>روڈ میپ</h2>
      <ol>
        <li>اپنی موجودہ حالت کا جائزہ لیں اور خلا کی نشاندہی کریں</li>
        <li>اپنے وژن اور مقاصد کی وضاحت کریں</li>
        <li>ایک حکمت عملی کا منصوبہ تیار کریں</li>
        <li>تبدیلیوں کو تدریجی طور پر نافذ کریں</li>
        <li>ترقی کی نگرانی کریں اور حسب ضرورت ایڈجسٹ کریں</li>
      </ol>
    `,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop",
    author: "Fatima Khan",
    authorUrdu: "فاطمہ خان",
    category: "Technology",
    categoryUrdu: "ٹیکنالوجی",
    tags: ["digital", "transformation", "technology"],
    publishedDate: new Date("2024-02-28"),
    order: 2,
    isPublished: true
  },
  {
    title: "Mastering Change Management: Lessons for Businesses",
    titleUrdu: "تبدیلی کے انتظام میں مہارت: کاروباروں کے لیے اسباق",
    excerpt: "Explore proven strategies for managing organizational change and ensuring successful implementation of new initiatives.",
    excerptUrdu: "تنظیمی تبدیلی کے انتظام اور نئی پہل کی کامیاب عمل آوری کو یقینی بنانے کے لیے ثابت شدہ حکمت عملیوں کو دریافت کریں۔",
    content: `
      <h2>Why Change Management Matters</h2>
      <p>Effective change management is crucial for organizational success. It helps minimize resistance, maintain productivity, and ensure smooth transitions.</p>
      
      <h2>Key Principles</h2>
      <ul>
        <li>Clear communication at all levels</li>
        <li>Involve stakeholders early and often</li>
        <li>Provide adequate training and support</li>
        <li>Celebrate small wins along the way</li>
        <li>Be flexible and adapt as needed</li>
      </ul>
      
      <h2>Best Practices</h2>
      <p>Start with a clear vision, build a strong coalition, and maintain momentum throughout the change process.</p>
    `,
    contentUrdu: `
      <h2>تبدیلی کے انتظام کی اہمیت</h2>
      <p>موثر تبدیلی کا انتظام تنظیمی کامیابی کے لیے بہت اہم ہے۔ یہ مزاحمت کو کم کرنے، پیداواری صلاحیت کو برقرار رکھنے، اور ہموار تبدیلیوں کو یقینی بنانے میں مدد کرتا ہے۔</p>
      
      <h2>کلیدی اصول</h2>
      <ul>
        <li>تمام سطحوں پر واضح مواصلات</li>
        <li>اسٹیک ہولڈرز کو ابتدائی اور اکثر شامل کریں</li>
        <li>مناسب تربیت اور مدد فراہم کریں</li>
        <li>راستے میں چھوٹی کامیابیوں کا جشن منائیں</li>
        <li>لچکدار رہیں اور حسب ضرورت ایڈجسٹ کریں</li>
      </ul>
    `,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    author: "Hassan Raza",
    authorUrdu: "حسن رضا",
    category: "Business",
    categoryUrdu: "کاروبار",
    tags: ["management", "change", "leadership"],
    publishedDate: new Date("2024-02-28"),
    order: 3,
    isPublished: true
  },
  {
    title: "Building Customer Loyalty Through Exceptional Service",
    titleUrdu: "بہترین سروس کے ذریعے کسٹمر کی وفاداری تعمیر کرنا",
    excerpt: "Understand the key principles of customer service excellence and how they contribute to long-term business success.",
    excerptUrdu: "کسٹمر سروس کی بہترین کارکردگی کے کلیدی اصولوں کو سمجھیں اور یہ کیسے طویل مدتی کاروباری کامیابی میں حصہ ڈالتے ہیں۔",
    content: `
      <h2>The Foundation of Customer Loyalty</h2>
      <p>Exceptional customer service is the cornerstone of building lasting relationships and driving business growth.</p>
      
      <h2>Essential Elements</h2>
      <ul>
        <li>Quick response times</li>
        <li>Personalized interactions</li>
        <li>Proactive problem-solving</li>
        <li>Consistent quality across all touchpoints</li>
        <li>Going above and beyond expectations</li>
      </ul>
      
      <h2>Measuring Success</h2>
      <p>Track metrics like customer satisfaction scores, retention rates, and net promoter scores to gauge your service quality.</p>
    `,
    contentUrdu: `
      <h2>کسٹمر کی وفاداری کی بنیاد</h2>
      <p>بہترین کسٹمر سروس پائیدار تعلقات بنانے اور کاروباری ترقی کو فروغ دینے کی بنیاد ہے۔</p>
      
      <h2>ضروری عناصر</h2>
      <ul>
        <li>تیز جوابی اوقات</li>
        <li>ذاتی نوعیت کی بات چیت</li>
        <li>پیشگی مسئلہ حل کرنا</li>
        <li>تمام رابطے کے مقامات پر مستقل معیار</li>
        <li>توقعات سے بڑھ کر کام کرنا</li>
      </ul>
    `,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop",
    author: "Ayesha Malik",
    authorUrdu: "عائشہ ملک",
    category: "Customer Experience",
    categoryUrdu: "کسٹمر کا تجربہ",
    tags: ["customer", "service", "loyalty"],
    publishedDate: new Date("2024-02-25"),
    order: 4,
    isPublished: true
  },
  {
    title: "Sustainable Business Practices for Modern Companies",
    titleUrdu: "جدید کمپنیوں کے لیے پائیدار کاروباری طریقے",
    excerpt: "Learn how integrating sustainability into your business strategy can drive value and build stakeholder trust.",
    excerptUrdu: "جانیں کہ اپنی کاروباری حکمت عملی میں پائیداری کو شامل کرنا کیسے قدر پیدا کر سکتا ہے اور اسٹیک ہولڈرز کا اعتماد بنا سکتا ہے۔",
    content: `
      <h2>The Business Case for Sustainability</h2>
      <p>Sustainable practices are no longer optional—they're essential for long-term business viability and stakeholder trust.</p>
      
      <h2>Key Areas of Focus</h2>
      <ul>
        <li>Environmental impact reduction</li>
        <li>Social responsibility initiatives</li>
        <li>Ethical supply chain management</li>
        <li>Resource efficiency and waste reduction</li>
        <li>Transparent reporting and accountability</li>
      </ul>
      
      <h2>Getting Started</h2>
      <p>Begin with an assessment of your current practices, set clear sustainability goals, and create an actionable roadmap.</p>
    `,
    contentUrdu: `
      <h2>پائیداری کے لیے کاروباری کیس</h2>
      <p>پائیدار طریقے اب اختیاری نہیں رہے—وہ طویل مدتی کاروباری قابلیت اور اسٹیک ہولڈرز کے اعتماد کے لیے ضروری ہیں۔</p>
      
      <h2>توجہ کے کلیدی شعبے</h2>
      <ul>
        <li>ماحولیاتی اثر میں کمی</li>
        <li>سماجی ذمہ داری کی پہل</li>
        <li>اخلاقی سپلائی چین کا انتظام</li>
        <li>وسائل کی کارکردگی اور فضلہ میں کمی</li>
        <li>شفاف رپورٹنگ اور جوابدہی</li>
      </ul>
    `,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    author: "Usman Sheikh",
    authorUrdu: "عثمان شیخ",
    category: "Sustainability",
    categoryUrdu: "پائیداری",
    tags: ["sustainability", "environment", "business"],
    publishedDate: new Date("2024-02-22"),
    order: 5,
    isPublished: true
  },
  {
    title: "The Future of Remote Work and Team Collaboration",
    titleUrdu: "دور دراز کام کا مستقبل اور ٹیم کا تعاون",
    excerpt: "Explore the evolving landscape of remote work and discover tools and strategies for effective team collaboration.",
    excerptUrdu: "دور دراز کام کے بدلتے ہوئے منظر نامے کو دریافت کریں اور موثر ٹیم تعاون کے لیے ٹولز اور حکمت عملیوں کو دریافت کریں۔",
    content: `
      <h2>The Remote Work Revolution</h2>
      <p>Remote work has transformed how teams collaborate and how businesses operate, creating new opportunities and challenges.</p>
      
      <h2>Essential Tools and Practices</h2>
      <ul>
        <li>Video conferencing platforms</li>
        <li>Project management software</li>
        <li>Cloud-based collaboration tools</li>
        <li>Clear communication protocols</li>
        <li>Regular check-ins and team building</li>
      </ul>
      
      <h2>Best Practices</h2>
      <p>Establish clear expectations, maintain regular communication, and foster a strong team culture even when working remotely.</p>
    `,
    contentUrdu: `
      <h2>دور دراز کام کی انقلاب</h2>
      <p>دور دراز کام نے ٹیموں کے تعاون اور کاروباروں کے کام کرنے کے طریقے کو تبدیل کر دیا ہے، نئے مواقع اور چیلنجز پیدا کیے ہیں۔</p>
      
      <h2>ضروری ٹولز اور طریقے</h2>
      <ul>
        <li>ویڈیو کانفرنسنگ پلیٹ فارمز</li>
        <li>پروجیکٹ مینجمنٹ سافٹ ویئر</li>
        <li>کلاؤڈ بیسڈ تعاون کے ٹولز</li>
        <li>واضح مواصلاتی پروٹوکول</li>
        <li>باقاعدہ چیک ان اور ٹیم بلڈنگ</li>
      </ul>
    `,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop",
    author: "Zainab Abbas",
    authorUrdu: "زینب عباس",
    category: "Technology",
    categoryUrdu: "ٹیکنالوجی",
    tags: ["remote", "work", "collaboration"],
    publishedDate: new Date("2024-02-20"),
    order: 6,
    isPublished: true
  }
];

async function seedBlogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');

    // Clear existing blogs first
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    // Insert dummy blogs
    const inserted = await Blog.insertMany(dummyBlogs);
    console.log(`✅ Successfully added ${inserted.length} blogs with content!`);

    // Display added blogs
    inserted.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} - ${blog.category}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
}

seedBlogs();
