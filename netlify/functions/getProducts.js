// This is the final, updated Netlify Function.
// It fetches BOTH the products AND the hero images from your Site Settings.

exports.handler = async function(event, context) {
  // Securely get your secret keys from the Netlify environment
  const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = process.env;

  const apiEndpoint = `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}`;

  // This GraphQL query now asks for two things: the product collection AND the site settings collection.
  const graphqlQuery = {
    query: `
      query {
        productCollection(order: sys_publishedAt_DESC) {
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
        siteSettingsCollection(limit: 1) {
          items {
            heroImagesCollection {
              items {
                url(transform: {width: 200, height: 200, quality: 85, format: JPG})
              }
            }
          }
        }
      }
    `
  };

  try {
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
    
    // We now structure the response to send both pieces of data back to the website.
    const responseData = {
        products: data.data.productCollection.items,
        siteSettings: data.data.siteSettingsCollection.items[0] || {}
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    console.error('Error in Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data.' }),
    };
  }
};

