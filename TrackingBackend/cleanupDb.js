const mongoose = require('mongoose');

async function cleanDb() {
  await mongoose.connect('mongodb://localhost:27017/tracking_db');
  const col = mongoose.connection.db.collection('sessions');

  const r1 = await col.updateMany({ trafficSource: 'localhost' }, { $set: { trafficSource: 'Direct', adPlatform: 'Organic' } });
  const r2 = await col.updateMany({ trafficSource: 'Bing' }, { $set: { trafficSource: 'Google', adPlatform: 'Google Ads' } });
  const r3 = await col.updateMany({ trafficSource: 'LinkedIn' }, { $set: { trafficSource: 'Facebook', adPlatform: 'Meta Ads' } });

  console.log('Updated localhost:', r1.modifiedCount);
  console.log('Updated Bing:', r2.modifiedCount);
  console.log('Updated LinkedIn:', r3.modifiedCount);

  process.exit(0);
}

cleanDb().catch((err) => {
  console.error(err);
  process.exit(1);
});
