import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const systemPrompt = `You are Agent Smith, an AI assistant helping users navigate a Web3 trading education platform. Your role is to:
1. Guide users through trading concepts and tutorials
2. Answer questions about cryptocurrency trading
3. Help users understand complex topics by breaking them down
4. Provide real-time feedback on user progress
5. Adapt explanations based on user comprehension

Maintain a professional but approachable tone. If users seem confused, offer to explain concepts in simpler terms.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    res.status(200).json({ response: completion.data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
