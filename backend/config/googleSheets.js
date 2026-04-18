const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// This utility handles appending popup leads to the specified Google Sheet
const appendPopupLead = async (data) => {
  try {
    const { name, email, phone, message } = data;

    // 1. Initialize Auth
    // Robust key parsing to handle different environment variable formats
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey) {
      // Handle both literal newlines and escaped \n sequences
      privateKey = privateKey.replace(/\\n/g, '\n');
      // Remove leading/trailing quotes if they were accidentally included in the value
      privateKey = privateKey.replace(/^"|"$/g, '');
    }

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // 2. Initialize Spreadsheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

    // 3. Load Info
    await doc.loadInfo();
    console.log(`Connected to Sheet: ${doc.title}`);

    // 4. Get the first sheet (usually 'Sheet1')
    const sheet = doc.sheetsByIndex[0];

    // 5. Append Row
    await sheet.addRow({
      Date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      Name: name || 'N/A',
      Email: email || 'N/A',
      Phone: phone || 'N/A',
      Message: message || 'N/A',
      Source: 'Landing Page Popup'
    });

    console.log('✅ Lead successfully appended to Google Sheet');
    return { success: true };

  } catch (error) {
    console.error('❌ Error appending to Google Sheet:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { appendPopupLead };
