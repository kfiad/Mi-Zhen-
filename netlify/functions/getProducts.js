// This is a Netlify Function. It runs on Netlify's servers, not in the browser.
// It securely fetches your product data from Contentful.

// We need the Contentful SDK to talk to Contentful
const contentful = require('contentful');

// The handler function is the main entry point for the Netlify Function
exports.handler = async function(event, context) {
  // Get the secret keys from the environment variables you set in Netlify
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // If the keys are missing, return an error
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Contentful credentials are not set in the environment.' }),
    };
  }

  try {
    // Create a client to connect to Contentful
    const client = contentful.createClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_ACCESS_TOKEN,
    });

    // Fetch all entries of the 'product' content type
    const response = await client.getEntries({ content_type: 'product' });

    // Send the product data back to the website as a successful response
    return {
      statusCode: 200,
      body: JSON.stringify(response.items),
    };
  } catch (error) {
    // If there's an error fetching from Contentful, send back an error message
    console.error('Error fetching from Contentful:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from Contentful.' }),
    };
  }
};
