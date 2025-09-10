import { NextResponse } from 'next/server';

/**
 * Handles the POST request for the chatbot API.
 * This function processes the incoming message and returns a hardcoded reply.
 * @param {Request} req The incoming request object.
 * @returns {NextResponse} The response containing the chatbot's reply.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // Validate that a message was provided.
    if (!message) {
      return new NextResponse(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // Determine the bot's reply based on the user's message.
    const lower = message.toLowerCase();
    let reply = "I don't understand that. Please try another phrase.";

    if (lower.includes('hello') || lower.includes('hi')) {
      reply = 'Hello there! How can I help you today?';
    } else if (lower.includes('how are you')) {
      reply = 'I am doing great, thank you for asking! What about you?';
    } else if (lower.includes('what is your name')) {
      reply = "I am a chatbot created by a Gemini model. I don't have a name!";
    } else if (lower.includes('help')) {
      reply = 'I can help with simple questions. Try asking "how are you" or "hello".';
    } else if (lower.includes('joke')) {
      reply = "Why don't scientists trust atoms? Because they make up everything!";
    }

    // Return the determined reply in a JSON response.
    return new NextResponse(JSON.stringify({ reply }), {
      status: 200,
      headers: corsHeaders(),
    });

  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Something went wrong on the server.' }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

/**
 * Handle CORS preflight requests (OPTIONS).
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/**
 * Utility function for setting CORS headers.
 * Adjust "Access-Control-Allow-Origin" for production security.
 */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // 🔒 change to your frontend domain in production
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
