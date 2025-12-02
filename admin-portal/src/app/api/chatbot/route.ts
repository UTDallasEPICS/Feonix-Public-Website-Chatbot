import { NextRequest, NextResponse } from "next/server";
import { ChatOllama } from "@langchain/ollama";
import { augment } from "../../../../lib/utils";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
const { message, messages: fullHistory } = await req.json();



    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "No valid message provided" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const lower = message.toLowerCase().trim();

    // ------------------------------
    // STATIC FAQ LIST (UNCHANGED)
    // ------------------------------
    const defaultQuestions = [
      {
        query: "What is Catch a Ride?",
        answer:
          "**Catch a Ride** is a community mobility service that helps people facing transportation barriers get wherever they need to go—such as medical appointments, work, school, errands, or community events. It's operated by **Feonix - Mobility Rising**. Availability and any trip-purpose rules can vary by initiative and region.",
      },
      {
        query: "Am I eligible to use Catch a Ride?",
        answer:
          "Eligibility depends on your local program. Many riders qualify based on residency and trip purpose (for example: medical, work, school). I can share the general criteria and a quick check form. Would you like the eligibility checklist for your area?",
      },
      {
        query: "How do I book a ride?",
        answer:
          "You can book in the web portal or app. You'll choose pickup/drop-off locations, date/time, and trip purpose. If you're new, create an account first. Need the step-by-step guide?",
      },
      {
        query: "Do you offer wheelchair-accessible vehicles?",
        answer:
          "Yes—accessible options are available where supported. Select your accessibility needs when creating your booking, and we'll match you with an appropriate provider.",
      },
      {
        query: "How much does it cost?",
        answer:
          "Costs vary by program. Some trips are covered by a mobility wallet or a CBA sponsor. If you pay directly, you can use a rider-funded wallet or a personal card (where supported).",
      },
      {
        query: "What is a mobility wallet?",
        answer:
          "It's a preloaded balance used to pay for rides. It may be grant-funded or rider-funded. Wallet type depends on your program.",
      },
      {
        query: "Can I use both a CBA invoice and my wallet for the same trip?",
        answer:
          "No. Riders use one payment method consistently for a given trip purpose. CBA invoice and rider-funded wallet aren't combined for the same purpose.",
      },
      {
        query: "What if I need to cancel or change my ride?",
        answer:
          "You can modify or cancel in the portal or app within the allowed window. Late cancellations or no-shows may affect eligibility or fees, depending on your program.",
      },
      {
        query: "Do you serve my area?",
        answer:
          "Service areas vary. I can check by city/zip to see if there are initiatives near you. Would you like to look up your area?",
      },
      {
        query:
          "What's the difference between Uber rides and other providers for returns?",
        answer:
          "Return-trip rules can differ. Uber supports round trips and also offers flexible return options that most other providers do not. However, Uber is not available in all areas—especially in many rural regions where coverage is limited.",
      },
      {
        query: "How do I add money to my rider-funded wallet?",
        answer:
          "To add money to a rider-funded wallet, you'll need to call our Support Center. A specialist will help set up your wallet and process the payment. Once added, funds will be available for rides.",
      },
      {
        query: "I forgot my password.",
        answer:
          "Use Forgot password on the sign-in page. We'll email a reset link from noreply@catch-a-ride.skedgo.com. If you don't see it, check spam or ask a specialist for help.",
      },
      {
        query: "Are service animals allowed?",
        answer:
          "Yes. Service animals are welcome. Please note it during booking so the driver is prepared.",
      },
      {
        query: "How do I contact a person?",
        answer:
          "I can connect you with a support specialist during business hours or share a contact form. Would you like the phone number or form link?",
      },
    ];

    const normalized = lower.replace(/[^\w\s]/g, "");
    const match = defaultQuestions.find((q) =>
      normalized.includes(q.query.toLowerCase().replace(/[^\w\s]/g, ""))
    );

    // ------------------------------
    // IF STATIC FAQ MATCH → RETURN IT
    // ------------------------------
    if (match) {
      return NextResponse.json(
        { message: match.answer, source: "faq" },
        { headers: CORS_HEADERS }
      );
    }

    // ------------------------------
    // ELSE → FALLBACK TO AI RESPONSE
    // ------------------------------
// Convert frontend messages → history array for augment()
const history = Array.isArray(fullHistory)
  ? fullHistory.map((m: any) => ({
      role: m.role,
      message: m.content,
    }))
  : [];
  console.log("=== FULL HISTORY RECEIVED ===");
console.log(history);

    const context = [];

    const augmentedPrompt = augment(history, context, message);

    const llm = new ChatOllama({
      model: "gpt-oss:20b",
      temperature: 0,
      maxRetries: 2,
    });

    const aiResponse = (await llm.invoke(augmentedPrompt)).content;

    return NextResponse.json(
      { message: aiResponse, source: "ai" },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
