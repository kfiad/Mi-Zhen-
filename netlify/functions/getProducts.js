// This is the final, improved Netlify Function.
// It has zero dependencies and uses a direct API call for reliability.

exports.handler = async function(event, context) {
  // Securely get your secret keys from the Netlify environment
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  // The endpoint for Contentful's GraphQL API
  const apiEndpoint = `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}`;

  // This is a GraphQL query to get all your product data
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

    if (!response.ok) {
        throw new Error(`Contentful API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const products = data.data.productCollection.items;

    // Send the list of products back to the website successfully
    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };

  } catch (error) {
    console.error('Error in Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data.' }),
    };
  }
};

