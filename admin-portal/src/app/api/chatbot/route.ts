import { NextResponse } from 'next/server';

/**
 * Handles the POST request for the chatbot API.
 * This function processes the incoming message and returns a reply with references.
 * @param {Request} req The incoming request object.
 * @returns {NextResponse} The response containing the chatbot's reply.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return jsonResponse({ error: 'No valid message provided' }, 400);
    }

    const lower = message.toLowerCase();

    // Example: keyword groups for variation & synonyms
    const responses = [
      {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'yo'],
        replies: [
          "Hello there! 👋",
          "Hey! How’s it going?",
          "Hi! What’s up?"
        ],
        references: ["https://en.wikipedia.org/wiki/Greeting"]
      },
      {
        keywords: ['bye', 'goodbye', 'see you'],
        replies: [
          "Goodbye! Have a great day!",
          "See you later!",
          "Take care, bye!"
        ],
        references: ["https://en.wikipedia.org/wiki/Farewell"]
      },
      {
        keywords: ['thank you', 'thanks', 'thx'],
        replies: [
          "You're welcome! 😊",
          "No problem at all!",
          "Glad I could help!"
        ],
        references: ["https://en.wikipedia.org/wiki/Gratitude"]
      },
      {
        keywords: ['how are you'],
        replies: [
          "I’m doing great, thanks for asking! How about you?",
          "I’m all good! What about you?",
          "Fantastic! How are you feeling today?"
        ],
        references: ["https://www.wikihow.com/Answer-How-Are-You"]
      },
      {
        keywords: ['joke', 'funny'],
        replies: [
          "Why don't scientists trust atoms? Because they make up everything!",
          "Parallel lines have so much in common… it’s a shame they’ll never meet.",
          "Why was the math book sad? Because it had too many problems."
        ],
        references: ["https://pun.me/pages/funny-jokes.php"]
      },
      {
        keywords: ['help', 'what can you do'],
        replies: [
          "I can greet you, tell jokes, answer simple questions, and chat a little.",
          "Try saying 'hello', 'joke', 'bye', or 'thank you'!",
          "I’m here for simple chat. Ask me something!"
        ],
        references: ["https://developer.mozilla.org/", "https://nextjs.org/docs"]
      }
    ];

    // Default reply
    let reply = "I don't understand that. Please try another phrase.";
    let references = [
      "https://developer.mozilla.org/",
      "https://nextjs.org/docs",
      "https://ai.google.dev/"
    ];

    // Match intent
    for (const { keywords, replies, references: ref } of responses) {
      if (keywords.some(k => lower.includes(k))) {
        // Pick a random reply from replies array
        reply = replies[Math.floor(Math.random() * replies.length)];
        references = ref;
        break;
      }
    }

    return jsonResponse({ reply, references });

  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse({ error: 'Something went wrong on the server.' }, 500);
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
 * Utility: JSON response with CORS headers
 */
function jsonResponse(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  });
}

/**
 * Utility: CORS headers
 * Adjust "Access-Control-Allow-Origin" for production security.
 */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // 🔒 change to your frontend domain in production
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
