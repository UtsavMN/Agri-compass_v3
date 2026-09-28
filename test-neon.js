const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://utsavmn26:npg_DPC3an8RgFSh@ep-royal-hat-atayzkpd.us-east-1.aws.neon.tech/neondb?sslmode=require'
});
client.connect().then(() => { console.log('Connected!'); client.end(); }).catch(err => { console.error('Error:', err.message); client.end(); });
