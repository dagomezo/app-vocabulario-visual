require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log('MongoDB OK');
    return mongoose.connection.close();
  })
  .catch((err) => {
    console.error('MongoDB FAIL:', err.message);
    process.exit(1);
  });
