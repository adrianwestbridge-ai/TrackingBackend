const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const Session = require('./models/Session');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracking_db';

// FAKE demo records for manually seeding a real MongoDB during local development.
// Run explicitly with `node seedData.js` if you want sample data to look at.
// This file is NOT imported or auto-loaded by the server or the in-memory
// fallback store - the dashboard never shows these unless you run this script.
const usDummyRecords = [
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'http://localhost:5173/',
    mobile: '+1 (310) 555-0192',
    ipAddress: '104.28.19.42',
    device: 'iPhone 16 Pro',
    os: 'iOS 18.5',
    browser: 'Safari Mobile',
    trafficSource: 'Facebook',
    adPlatform: 'Meta Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 3600000 * 5) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 3600000 * 5 + 45000) },
    ],
    metadata: {
      customerName: 'Michael Miller',
      customerEmail: 'michael.miller@gmail.com',
      fullMobileNumber: '+1 (310) 555-0192',
      queryType: 'For Customer Queries',
      feedbackMessage: 'Hi, looking for full residential pest management pricing for my home in Westwood, CA.',
      referenceId: 'QRY-US89A12',
      location: 'Los Angeles, California, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'https://pestcontrolprousa.com/',
    mobile: '+1 (212) 555-0148',
    ipAddress: '174.72.220.174',
    device: 'MacBook Pro 16"',
    os: 'macOS Sonoma 14.5',
    browser: 'Google Chrome 128',
    trafficSource: 'Google',
    adPlatform: 'Google Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 3600000 * 4) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 3600000 * 4 + 60000) },
    ],
    metadata: {
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.j.design@outlook.com',
      fullMobileNumber: '+1 (212) 555-0148',
      queryType: 'Business & Corporate Inquiry',
      feedbackMessage: 'Requesting quarterly commercial pest inspection & maintenance quote for our Manhattan office building.',
      referenceId: 'QRY-US41B90',
      location: 'New York City, New York, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 4),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'http://localhost:5173/',
    mobile: '+1 (312) 555-0183',
    ipAddress: '67.161.42.10',
    device: 'Dell XPS 15',
    os: 'Windows 11 Enterprise',
    browser: 'Microsoft Edge 128',
    trafficSource: 'TikTok',
    adPlatform: 'TikTok Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 3600000 * 3.5) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 3600000 * 3.5 + 30000) },
    ],
    metadata: {
      customerName: 'David Thompson',
      customerEmail: 'dthompson99@yahoo.com',
      fullMobileNumber: '+1 (312) 555-0183',
      queryType: 'Technical Support & Helpdesk',
      feedbackMessage: 'Need assistance with scheduling termite prevention inspection for next Monday morning.',
      referenceId: 'QRY-US72C15',
      location: 'Chicago, Illinois, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 3.5),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'https://www.bigtree.in/',
    mobile: '+1 (713) 555-0177',
    ipAddress: '72.182.11.9',
    device: 'iPad Air 5',
    os: 'iPadOS 17.6',
    browser: 'Apple Safari',
    trafficSource: 'Instagram',
    adPlatform: 'Meta Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 3600000 * 3) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 3600000 * 3 + 50000) },
    ],
    metadata: {
      customerName: 'Emily Davis',
      customerEmail: 'emily.davis@txhealth.org',
      fullMobileNumber: '+1 (713) 555-0177',
      queryType: 'Feedback & Service Review',
      feedbackMessage: 'The service technician was prompt and very thorough during yesterday inspection in Houston. Thank you!',
      referenceId: 'QRY-US99D48',
      location: 'Houston, Texas, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 3),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'http://localhost:5173/',
    mobile: '+1 (602) 555-0121',
    ipAddress: '172.56.21.88',
    device: 'Samsung Galaxy S24 Ultra',
    os: 'Android 14 (One UI 6.1)',
    browser: 'Chrome Mobile 128',
    trafficSource: 'Google',
    adPlatform: 'Google Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 3600000 * 2.5) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 3600000 * 2.5 + 40000) },
    ],
    metadata: {
      customerName: 'James Wilson',
      customerEmail: 'jwilson.phx@gmail.com',
      fullMobileNumber: '+1 (602) 555-0121',
      queryType: 'For Customer Queries',
      feedbackMessage: 'Need emergency scorpion and perimeter pest treatment for my single-family home in Phoenix.',
      referenceId: 'QRY-US18E63',
      location: 'Phoenix, Arizona, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 2.5),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'https://pestcontrolprousa.com/',
    mobile: '+1 (305) 555-0164',
    ipAddress: '173.245.54.112',
    device: 'iPhone 15 Pro Max',
    os: 'iOS 18.1',
    browser: 'Facebook In-App Browser',
    trafficSource: 'Facebook',
    adPlatform: 'Meta Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 3600000 * 2) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 3600000 * 2 + 35000) },
    ],
    metadata: {
      customerName: 'Jessica Taylor',
      customerEmail: 'jtaylor.realty@gmail.com',
      fullMobileNumber: '+1 (305) 555-0164',
      queryType: 'Business & Corporate Inquiry',
      feedbackMessage: 'Managing 5 luxury vacation rental properties in South Beach. Looking for annual service maintenance agreement.',
      referenceId: 'QRY-US52F34',
      location: 'Miami, Florida, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'http://localhost:5173/',
    mobile: '+1 (206) 555-0139',
    ipAddress: '50.232.112.5',
    device: 'MacBook Air M3',
    os: 'macOS Sequoia 15.0',
    browser: 'Mozilla Firefox 129',
    trafficSource: 'TikTok',
    adPlatform: 'TikTok Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 3600000 * 1.5) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 3600000 * 1.5 + 55000) },
    ],
    metadata: {
      customerName: 'Robert Anderson',
      customerEmail: 'randerson@amazon.com',
      fullMobileNumber: '+1 (206) 555-0139',
      queryType: 'For Customer Queries',
      feedbackMessage: 'Requesting an eco-friendly & pet-safe pest treatment consultation for suburban residence in Seattle.',
      referenceId: 'QRY-US83G91',
      location: 'Seattle, Washington, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 1.5),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'https://www.bigtree.in/',
    mobile: '+1 (303) 555-0155',
    ipAddress: '76.120.45.19',
    device: 'Lenovo ThinkPad X1',
    os: 'Windows 11 Pro',
    browser: 'Google Chrome 128',
    trafficSource: 'TikTok',
    adPlatform: 'TikTok Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 3600000 * 1) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 3600000 * 1 + 25000) },
    ],
    metadata: {
      customerName: 'Amanda White',
      customerEmail: 'amanda.white@denverpost.com',
      fullMobileNumber: '+1 (303) 555-0155',
      queryType: 'Feedback & Service Review',
      feedbackMessage: 'Outstanding customer care! The rodent barrier installation resolved our issue completely within 48 hours.',
      referenceId: 'QRY-US27H40',
      location: 'Denver, Colorado, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 3600000 * 1),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'http://localhost:5173/',
    mobile: '+1 (404) 555-0112',
    ipAddress: '98.168.32.41',
    device: 'Google Pixel 8 Pro',
    os: 'Android 14',
    browser: 'Chrome Mobile 128',
    trafficSource: 'Google',
    adPlatform: 'Google Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 1800000) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 1750000) },
    ],
    metadata: {
      customerName: 'Christopher Martinez',
      customerEmail: 'cmartinez.atl@gmail.com',
      fullMobileNumber: '+1 (404) 555-0112',
      queryType: 'Technical Support & Helpdesk',
      feedbackMessage: 'Inquiring if your extermination team provides hornet nest removal near high roof eaves.',
      referenceId: 'QRY-US64I78',
      location: 'Atlanta, Georgia, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    sessionId: `sess_us_${Math.random().toString(36).substring(2, 10)}`,
    landingPage: 'https://pestcontrolprousa.com/',
    mobile: '+1 (617) 555-0198',
    ipAddress: '140.247.0.1',
    device: 'iPad Pro 12.9"',
    os: 'iPadOS 18.0',
    browser: 'Apple Safari 18',
    trafficSource: 'TikTok',
    adPlatform: 'TikTok Ads',
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date(Date.now() - 600000) },
      { name: 'CONTACT_FORM_SUBMITTED', timestamp: new Date(Date.now() - 550000) },
    ],
    metadata: {
      customerName: 'Ashley Harris',
      customerEmail: 'ashley.harris@harvard.edu',
      fullMobileNumber: '+1 (617) 555-0198',
      queryType: 'Business & Corporate Inquiry',
      feedbackMessage: 'Interested in facility sanitation, environmental auditing & quarterly pest monitoring setup.',
      referenceId: 'QRY-US91J02',
      location: 'Boston, Massachusetts, USA',
      autoDetected: true,
    },
    createdAt: new Date(Date.now() - 600000),
  },
];

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${mongoURI}...`);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Inserting 10 authentic US visitor records into MongoDB...');
    const inserted = await Session.insertMany(usDummyRecords);
    
    console.log(`✅ Successfully inserted ${inserted.length} US records into MongoDB!`);
    console.log('Inserted Records Summary:');
    inserted.forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.metadata.location}] ${item.metadata.customerName} (${item.metadata.fullMobileNumber}) - ${item.landingPage}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = usDummyRecords;
