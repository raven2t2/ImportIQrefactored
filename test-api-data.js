import axios from 'axios';

async function testAPIs() {
  console.log('Testing GOONET JDM API...');
  try {
    const jdmResponse = await axios.get('https://api.apify.com/v2/datasets/VMNgVmAgcCNYQZtNI/items?clean=true&format=json&limit=1');
    console.log('JDM API Response:');
    console.log('Data type:', typeof jdmResponse.data);
    console.log('Is array:', Array.isArray(jdmResponse.data));
    console.log('Length:', jdmResponse.data.length);
    if (jdmResponse.data.length > 0) {
      console.log('First item keys:', Object.keys(jdmResponse.data[0]));
      console.log('Sample item:', JSON.stringify(jdmResponse.data[0], null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error('JDM API Error:', error.message);
  }

  console.log('\nTesting US Classic API...');
  try {
    const usResponse = await axios.get('https://api.apify.com/v2/datasets/EFjwLXRVn4w9QKgPV/items?clean=true&format=json&limit=1');
    console.log('US API Response:');
    console.log('Data type:', typeof usResponse.data);
    console.log('Is array:', Array.isArray(usResponse.data));
    console.log('Length:', usResponse.data.length);
    if (usResponse.data.length > 0) {
      console.log('First item keys:', Object.keys(usResponse.data[0]));
      console.log('Sample item:', JSON.stringify(usResponse.data[0], null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error('US API Error:', error.message);
  }
}

testAPIs();