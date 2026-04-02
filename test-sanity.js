/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-25',
  useCdn: false
});

async function testConnection() {
  try {
    console.log('Testing Sanity connection...', {
      projectId: client.config().projectId,
      dataset: client.config().dataset
    });
    const data = await client.fetch('*[_type == "post"]{_id, title}');
    console.log('Success! Found posts:', data.length);
    console.log(data);
  } catch (error) {
    console.error('Sanity connection error:', error.message);
  }
}

testConnection();
