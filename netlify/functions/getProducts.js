// This is the final, improved Netlify Function.
// It has zero dependencies and uses a direct API call for reliability.

exports.handler = async function(event, context) {
  // Securely get your secret keys from the Netlify environment
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // The endpoint for Contentful's GraphQL API, which is a modern and efficient way to get data
  const apiEndpoint = `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}`;

  // This is a GraphQL query. It's a precise way to ask for exactly the data we need for your products.
  const graphqlQuery = {
    query: `
      query {
        productCollection {
          items {
            sys { id }
            productName
            price
            shortDescription
            productImage {
              url(transform: {width: 400, height: 400, quality: 80, format: JPG})
            }
          }
        }
      }
    `
  };

  try {
    // Use the built-in 'fetch' to make a secure request to Contentful's API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(graphqlQuery),
    });

    // If the response is not successful, throw an error to be caught below
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Contentful API error: ${response.statusText} - ${errorBody}`);
    }
    
    // Parse the JSON data from the response
    const data = await response.json();
    
    // The products are nested inside data.data.productCollection.items
    const products = data.data.productCollection.items;

    // Send the clean list of products back to the website successfully
    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };

  } catch (error) {
    // If any error occurs, log it for debugging and send a generic error message back to the website
    console.error('Error in Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from Contentful.' }),
    };
  }
};

