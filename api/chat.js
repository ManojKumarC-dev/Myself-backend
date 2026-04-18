export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { message } = req.body;

  
  const models = [
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "z-ai/glm-4.5-air:free",
    "openai/gpt-oss-20b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-12b:free",
    "nousresearch/hermes-3-405b-instruct:free"
  ];

  for (let model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are Manoj. Speak simple and practical."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        return res.status(200).json({
          reply: data.choices[0].message.content,
          model: model
        });
      }

    } catch (err) {
      continue;
    }
  }


  res.status(500).json({
    reply: "All free models are busy. Try again later."
  });
}
