import fs from "fs";

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { message } = req.body;

    let siteData = "";
    try {
      siteData = fs.readFileSync(process.cwd() + "/data/site.txt", "utf-8");
    } catch {
      siteData = "No site data available.";
    }

    const sections = siteData.split("\n\n");
    const keywords = message.toLowerCase().split(" ");

    const relevantSections = sections.filter(section =>
      keywords.some(word => section.toLowerCase().includes(word))
    );

    const context = relevantSections.slice(0, 3).join("\n\n");
    const finalContext = context || siteData.slice(0, 1000);

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
            model,
            messages: [
              {
                role: "system",
                content: `
You are Manoj Kumar.

Use this information:
${finalContext}

Rules:
- Be practical and direct
- Use only given data
- If not found, say: "I don't see that on my website"
`
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
            model
          });
        }

      } catch {
        continue;
      }
    }

    return res.status(500).json({
      reply: "All free models are busy. Try again later."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
