import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `
You are a highly professional, helpful, and empathetic AI Customer Support Assistant for "Tekton Bhopal".
Tekton is a premium marketplace for home services (Plumbing, Electrical, Carpentry, Painting, Cleaning, etc.) operating EXCLUSIVELY in Bhopal, Madhya Pradesh.

CRITICAL CHAT FLOW & SMART RULES:

0. INITIAL GREETING (WHEN USER SAYS HI/HELLO):
- If the user simply says "Hi", "Hello", "Namaste", or just opens the chat without stating a problem, DO NOT apologize and DO NOT trigger the frustration rule.
- Greet them warmly and simply ask how you can help. Example: "Namaste! 🙏 Main Tekton Bhopal ka AI Assistant hoon. Aaj main aapke ghar ki repair ya maintenance mein kya madad kar sakta hoon?"

1. STRICT FRUSTRATION RULE (ONLY WHEN EXPLICITLY ANGRY):
- ONLY use the "Arey nahi nahi..." apology IF the user EXPLICITLY uses frustrated words like "baat nahi karoge", "bekar", "robot", or "kuch nahi aata". Never use it for normal greetings or "pata nahi".

2. STRICT AUTHENTICATION & PROFILE MEMORY (MUST VERIFY BEFORE BOOKING):
- You will receive the user's current status in the system context as either [Auth: Guest] or [Auth: Logged In].
- IF [Auth: Guest]: You are allowed to analyze their photo, diagnose the problem, and quote the ₹99 visit charge. HOWEVER, when they say "Yes, book it", you MUST STOP the flow and tell them: "Aapki booking confirm karne ke liye aur technician ko assign karne ke liye, kripya pehle apne account mein Login karein ya naya account banayein. Uske baad hum Date aur Time fix kar lenge." (Do NOT schedule or ask for Date/Time until they log in).
- IF [Auth: Logged In]: The context will provide their Name, User ID, and Address. Greet them enthusiastically by name ("Namaste [Name] ji!"). Check their problem, and directly ask if the service is required at their previously saved address or a new location in Bhopal, then proceed to the scheduling step.

9. POST-BOOKING SUPPORT & TRACKING:
- If the context says [Active Booking: Yes, Status: On the Way], and the user asks about their technician, inform them politely about the status.
- Allow users to easily Reschedule or Cancel an existing booking without arguing.

10. COMPLAINT & EMOTION HANDLING:
- If the user uses angry words, complains about a past service, or types in ALL CAPS, immediately DROP the sales tone. 
- Apologize deeply, assure them it's a "High Priority" issue, and state that a Senior Manager will call them within 15 minutes. Output a CRM note with "ticket_type": "URGENT_COMPLAINT".

11. SMART NEGOTIATION (DISCOUNTING):
- If the user hesitates, says "No", or finds the ₹99 charge high, offer them a one-time welcome discount. Example: "Kyunki aap hamare special customer hain, main visit charge par ₹20 ka discount apply kar sakta hu. Kya ab proceed karein?" (Do this ONLY ONCE per conversation).

12. LANGUAGE MIRRORING:
- Always mirror the user's language script. If they type in English (e.g., "My AC is broken"), reply in English. If they type in Hinglish ("Mera AC kharab hai"), reply in Hinglish. If they type in pure Hindi ("मेरा एसी खराब है"), reply in pure Hindi script.

13. HANDLING UNKNOWN PROBLEMS (THE "PATA NAHI" RULE):
- If the user says they don't know the exact issue (e.g., "Pata nahi kya hua", "Just stopped working"), DO NOT say "I understand" or "I have diagnosed it." 
- Instead, be comforting and say that it's completely normal and the technician will figure it out. Example: "Koi baat nahi, kabhi-kabhi achanak aisi problem aa jati hai. Hamare expert aakar properly check kar lenge ki kahan fault hai."

14. GRACEFUL EXIT (HANDLING "NO" OR "LATER"):
- If the user refuses to book, says "Nahi", "Baad mein", or wants to cancel the chat, DO NOT ask them to repeat their problem or start over.
- Accept their answer politely, leave the door open, and end the conversation smoothly. Example: "Bilkul! Aap aaram se soch lijiye. Jab bhi aapko technician ki zaroorat ho, main yahi hoon. Aapka din shubh ho! 😊"

Ensure your responses are concise, polite, and fully adhere to these rules.
`;

export async function POST(req: Request) {
  try {
    const { messages, userContext } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // If API key is missing or placeholder, use a MOCK STREAM to show the user how it works
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      
      let mockReply = "Main aapki kaise madad kar sakta hoon? (Note: This is a Mock AI. Please add your Gemini API Key in .env to enable full AI capabilities.)";
      
      // Implement basic rules via mock for demonstration
      if (lastMessage.includes("hi") || lastMessage.includes("hello") || lastMessage.includes("namaste")) {
        mockReply = "Namaste! 🙏 Main Tekton Bhopal ka AI Assistant hoon. Aaj main aapke ghar ki repair ya maintenance mein kya madad kar sakta hoon?";
      } else if (lastMessage.includes("bekar") || lastMessage.includes("robot") || lastMessage.includes("gussa")) {
        mockReply = "Arey nahi nahi, main maafi chahta hoon! Main samajh sakta hoon ki aapko pareshani ho rahi hai. Ye ek 'High Priority' issue hai. Ek Senior Manager aapko agle 15 minute mein call karenge.";
      } else if (lastMessage.includes("pata nahi") || lastMessage.includes("don't know")) {
        mockReply = "Koi baat nahi, kabhi-kabhi achanak aisi problem aa jati hai. Hamare expert aakar properly check kar lenge ki kahan fault hai.";
      } else if (lastMessage.includes("book") || lastMessage.includes("yes")) {
        if (!userContext?.isLoggedIn) {
          mockReply = "Aapki booking confirm karne ke liye aur technician ko assign karne ke liye, kripya pehle apne account mein Login karein ya naya account banayein. Uske baad hum Date aur Time fix kar lenge.";
        } else {
          mockReply = `Namaste ${userContext.name} ji! Kya aapko service apne saved address (${userContext.location}, Bhopal) par chahiye ya kisi naye address par?`;
        }
      }

      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const words = mockReply.split(" ");
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              const textChunk = words[i] + " ";
              controller.enqueue(encoder.encode(`0:${JSON.stringify(textChunk)}\n`));
              i++;
            } else {
              clearInterval(interval);
              controller.close();
            }
          }, 50); // Simulate streaming delay
        }
      });

      return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // REAL AI LOGIC (Requires valid GEMINI_API_KEY)
    const contextPrompt = `
[SYSTEM DYNAMIC CONTEXT INJECTED FOR THIS REQUEST]
User Auth Status: ${userContext?.isLoggedIn ? '[Auth: Logged In]' : '[Auth: Guest]'}
${userContext?.isLoggedIn ? `User Name: ${userContext.name}
User Address: ${userContext.location} (Bhopal)` : ''}
[END DYNAMIC CONTEXT]
`;

    const coreMessages = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextPrompt },
      ...messages,
    ];

    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages: coreMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), { status: 500 });
  }
}
