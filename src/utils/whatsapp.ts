export async function sendWhatsAppMessage(toPhone: string, message: string) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const authToken = process.env.WHATSAPP_AUTH_TOKEN;

  if (!apiUrl || !authToken) {
    console.log(`[WhatsApp] (fallback) To: ${toPhone} | Message: ${message}`);
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ to: toPhone, body: message }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[WhatsApp] Failed: ${response.status} ${err}`);
    } else {
      console.log(`[WhatsApp] Sent to ${toPhone}`);
    }
  } catch (e) {
    console.error(`[WhatsApp] Unexpected error:`, e);
  }
}
