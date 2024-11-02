const axios = require('axios');
const cheerio = require('cheerio');

async function testWebsite() {
    try {
        console.log('Testing website accessibility...');
        
        const response = await axios.get('https://www.lakelevels.info/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        console.log('\nResponse Status:', response.status);
        console.log('Content Type:', response.headers['content-type']);
        console.log('Content Length:', response.data.length);

        const $ = cheerio.load(response.data);
        
        console.log('\nPage Structure:');
        console.log('Tables found:', $('table').length);
        console.log('Rows found:', $('tr').length);
        console.log('Data cells found:', $('td').length);

        // Print the first table structure
        const firstTable = $('table').first();
        console.log('\nFirst Table Structure:');
        firstTable.find('tr').each((i, row) => {
            const cells = $(row).find('td, th').map((_, cell) => $(cell).text().trim()).get();
            console.log(`Row ${i}:`, cells);
        });

    } catch (error) {
        console.error('Error testing website:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Headers:', error.response.headers);
        }
    }
}

testWebsite();