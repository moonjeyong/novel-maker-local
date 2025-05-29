const fetch = require('node-fetch');

async function testXaiApi() {
  const apiKey = 'xai-blwB0UnbNdoYkJLqKsNCWogWKM17RXDJGcfzUYlHTI3qlXjKiN0h4Xge2yGHdIb0KsnsJXuG81pxT3lU';
  
  console.log('Testing xAI API...');
  
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 50,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Success! Generated content:', data.choices[0]?.message?.content);
    } else {
      console.error('API Error:', text);
    }
  } catch (error) {
    console.error('Network/Parse Error:', error.message);
  }
}

testXaiApi(); 