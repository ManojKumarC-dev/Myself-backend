export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { message } = req.body;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free"",
      messages: [
        {
          role: "system",
          content: `You are Manoj Kumar. Speak simple and practical.`
        },
        {
          role: "user",
          content: message
        }
      ]
    })
  });

  const data = await response.json();

  console.log("OpenRouter response:", JSON.stringify(data));

  res.json({
    reply: data.choices?.[0]?.message?.content || JSON.stringify(data)
  });
}
