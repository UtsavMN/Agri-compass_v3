const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_DPC3an8RgFSh@ep-royal-hat-atayzkpd.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
});
client.connect().then(() => { console.log('Connected successfully!'); client.end(); }).catch(err => { console.error('Error:', err.message); client.end(); });
