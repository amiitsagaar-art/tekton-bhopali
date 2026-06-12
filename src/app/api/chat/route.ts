import { NextResponse } from "next/server";

// Bhopal zones list for detection
const BHOPAL_ZONES = [
  { name: "MP Nagar", keywords: ["mp nagar", "m.p. nagar", "mpnagar", "m p nagar"] },
  { name: "Kolar", keywords: ["kolar", "kolar road", "kolarroad"] },
  { name: "Arera Colony", keywords: ["arera", "arera colony", "areracolony"] },
  { name: "Indrapuri", keywords: ["indrapuri", "indrapury"] },
  { name: "Ayodhya Bypass", keywords: ["ayodhya", "ayodhya bypass", "ayodhyabypass"] },
  { name: "Awadhpuri", keywords: ["awadhpuri", "awadhpury"] },
  { name: "Gulmohar", keywords: ["gulmohar", "gulmohar colony"] },
  { name: "Bairagarh", keywords: ["bairagarh", "bairagar", "lalghati"] },
  { name: "Chhahni", keywords: ["chhahni", "chhani", "chhaney"] },
  { name: "TT Nagar", keywords: ["tt nagar", "t.t. nagar", "ttnagar", "new market"] },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message || "";
    const cleanInput = userMessage.trim().toLowerCase();

    // 1. Detect Bhopal Zone
    let detectedZone: string | null = null;
    for (const zone of BHOPAL_ZONES) {
      if (zone.keywords.some(kw => cleanInput.includes(kw))) {
        detectedZone = zone.name;
        break;
      }
    }

    let reply = "";
    let intent: any = null;

    // Helper to pick random element
    const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    // 2. Classify Message Intent
    if (cleanInput.match(/(plumber|paani|pani|toti|totiya|leak|pipe|nali|tapak|flush|sink|washroom|toilet|tap|nal|shower|gyser|geyser|drain|clog|leakage|water|tanki|tank)/i)) {
      intent = { type: "BOOKING", service: "Plumber", zone: detectedZone };
      
      const zoneText = detectedZone ? `bhiya ${detectedZone} me` : "colony me";
      const responses = [
        `Hao bhiya! 💧 Paani beh riya hai kya ghar mein? Bade pareshan dikh rahe ho. Hum turant top-class plumber bhej rahe hain ${zoneText}. Niche confirm karo, 10 minute me banda hazir!`,
        `Arey miya, paani ki nali ka lafda hai kya? Tension mat paalo ustaad! Humare paas ek number plumber hain jo turant leakage fix kar denge. Niche button daba ke confirm karo!`,
        `Hao bhiya, sink tapak riya hai ya tanki bhar gayi hai? Chinta mat karo, Tekton ke pass verified plumbers hain jo abhi rawana ho jayenge. Click karo aur confirm karo bhiya!`
      ];
      reply = pickRandom(responses);

    } else if (cleanInput.match(/(electrician|wiring|jal|light|pankha|switch|board|bijli|fan|cooler|heater|motor|current|shock|mcb|fuse|plug|short\s*circuit|bulb|led|power|socket|meter)/i)) {
      intent = { type: "BOOKING", service: "Electrician", zone: detectedZone };
      
      const zoneText = detectedZone ? `bhiya ${detectedZone} me` : "ustaad";
      const responses = [
        `Arey ustaad! ⚡ Bijli ka lafda lag riya hai kya? MCB trip ho rahi hai ya current maar raha hai? Chinta mat karo, top electrician abhi bhejte hain ${zoneText}. Niche confirm karo!`,
        `Hao bhiya, switchboard jal gaya ya fan nahi chal riya? Ek number professional ustaad ko rawana kar rahe hain jo sab wiring fix kar dega. Turant confirm karo bhiya!`,
        `Miya, short circuit ka darr hai kya? Ghabrao mat, bijli ka kaam bada sensitive hota hai. Humare certified expert ustaad 10 minute me pahunchenge. Confirm karo jaldi!`
      ];
      reply = pickRandom(responses);

    } else if (cleanInput.match(/(carpenter|wood|furniture|darwaza|tala|sofa|lakdi|door|table|chair|bed|almirah|almirhi|lock|handle|cabinet|drawer|window|khidki|chaukhat|chabi)/i)) {
      intent = { type: "BOOKING", service: "Carpenter", zone: detectedZone };
      
      const zoneText = detectedZone ? `bhiya ${detectedZone} me` : "colony me";
      const responses = [
        `Hao bhiya! 🔨 Darwaze ka lock kharab hai ya furniture banana hai? Carpenter ki zaroorat hai toh batao, ek ustaad abhi rawana kar rahe hain ${zoneText}. Niche confirm karo bhiya!`,
        `Arey miya, cupboard (almirah) ki chabi kharab ho gayi ya wooden kaam karwana hai? Fikar nahi karo ustaad, badhiya carpenter bhejte hain abhi. Click karo aur confirm karo!`,
        `Hao bhiya, chaukhat toot gayi ya handle dheela hai? Tekton ke top carpenters abhi rawana kar rahe hain. Confirm karke booking complete karo bhiya!`
      ];
      reply = pickRandom(responses);

    } else if (cleanInput.match(/(paint|color|rang|painter|deewar|diwar|wall|putty|distemper|brush|color*wash|safeda|punaee|punaai)/i)) {
      intent = { type: "BOOKING", service: "Painter", zone: detectedZone };
      
      const responses = [
        `Miya, deewar ko naya look dena hai ya putty lagwani hai? 🎨 Sabse sasta aur aala rang-rogain karne wala painter abhi bhejte hain. Niche confirm karo ustaad!`,
        `Hao bhiya, ghar me rang-punaee (paint) karwani hai kya? Tyohar aa raha hai, chinta mat karo ustaad, badhiya painter bhejenge. Niche click karke confirm karo!`,
        `Arey ustaad, deewar par dampness hai ya putty jhad rahe hai? Sahi ustaad painter abhi bhejte hain jo sab chamka dega. Turant booking confirm karo!`
      ];
      reply = pickRandom(responses);

    } else if (cleanInput.match(/(ac|cooler|fridge|refrigerator|thanda|cooling|filter|compressor|gas\s*filling|geyser)/i)) {
      intent = { type: "BOOKING", service: "AC & Appliances", zone: detectedZone };
      
      const responses = [
        `Hao bhiya! ❄️ AC thanda nahi kar riya ya fridge me cooling ka lafda hai? AC & Appliances ke expert ustaad abhi bhejenge. Niche confirm karo ustaad!`,
        `Miya, garmi bahut badh gayi hai aur AC ka filter kharab ho gaya kya? Tension nahi lene ka bhiya, service wale ko abhi rawana karte hain. Click karke confirm karo!`,
        `Arey ustaad, washing machine ya geyser me takleef hai? Fikar not bhiya, appliances repair ka master technician abhi pahunchega. Booking confirm karo!`
      ];
      reply = pickRandom(responses);

    } else if (cleanInput.match(/(hi|hello|namaste|hey|hlo|pranam|ram\s*ram|salam|bhiya|ustaad|miya|yo|ola|suno|help|madad|kya\s*hua|kaise\s*ho|kya\s*haal|sab\s*badhiya)/i)) {
      const responses = [
        `Namaste ustaad! 🙏 Main Tekton Bhopal ka AI Assistant hoon. Bataiye, aaj kounsa kaam karwana hai miya? Plumber 💧, Electrician ⚡, Carpenter 🔨, Painter 🎨, aur AC/Fridge Repair ❄️ sab available hain ustaad!`,
        `Hao bhiya! Kaise ho miya? Tekton Assistant par aapka swagat hai. Ghar ka koi bhi lafda ho—bijli, paani, furniture, ya painting—batao bhiya, abhi banda rawana karenge!`,
        `Ram Ram bhiya! 🙏 Salam ustaad! Bataiye kya seva karein aaj? Plumber, electrician, carpenter sab 10 minute me Bhopal me doorstep par haazir ho jayenge!`,
        `Sab badhiya hai bhiya! 🕺 Main Tekton AI Assistant hoon. Bataiye ghar me koi lafda ho toh—Plumber, Electrician, Carpenter sab ready hain. Kya kaam karwana hai?`
      ];
      reply = pickRandom(responses);

    } else {
      const responses = [
        `Arey miya, baat poori samajh nahi aayi ustaad. Ek baar saaf-saaf batao bhiya—Paani (Plumbing) ka lafda hai, Bijli (Electrician) ka, Furniture (Carpenter) ka, ya Deewar rangwani (Painter) hai? Tum bas bolo, bhejte hain banda!`,
        `Hao bhiya, thoda khul ke bataiye kya dikkat hai? Switchboard kharab hai, pipe leak ho riya hai, ya lock lagwana hai? Sahi bataoge toh sahi ustaad bhej paunga bhiya!`,
        `Miya, baat thodi dukhdayi lag rahi hai par clear nahi ho paayi. Plumber, Electrician, Carpenter, ya Painter—kise bhejna hai? Niche options me se select kar lo ya type karke batao ustaad!`
      ];
      reply = pickRandom(responses);
    }

    return NextResponse.json({
      reply,
      intent,
      nextStep: intent ? "confirm_service" : "idle",
      bookingData: intent ? { category: intent.service, location: intent.zone || "MP Nagar" } : {},
      isEmergency: false,
      isConfirmed: false
    });

  } catch (error: any) {
    console.error("Bhopali AI Engine Simulator Error:", error);
    return NextResponse.json({
      reply: "Hao bhiya, server me thoda lafda chal riya hai. Dobara message daalo.",
      intent: null,
      nextStep: "idle",
      bookingData: {}
    }, { status: 500 });
  }
}
