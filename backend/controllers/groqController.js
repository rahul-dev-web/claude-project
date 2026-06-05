const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

// Structured Prompt Engineering
const createStructuredPrompt = (userRequest, serverName) => {
  return `You are a Discord Server Management Assistant for server: "${serverName}".

ALLOWED ACTIONS:
- create_role: Create a new role with specified name and color
- delete_role: Delete an existing role by name
- create_channel: Create a text or voice channel
- delete_channel: Delete a channel by name
- set_permissions: Modify role permissions
- ban_member: Ban a user from the server
- kick_member: Remove a user from the server

USER REQUEST: "${userRequest}"

RESPOND ONLY WITH VALID JSON FORMAT:
{
  "action": "action_name",
  "parameters": {
    "name": "value",
    "description": "description if needed",
    "color": 9807270
  },
  "reason": "brief explanation of the action"
}

If request is invalid or dangerous, respond with:
{
  "error": true,
  "message": "Why this action is not allowed"
}

IMPORTANT:
- Be concise
- Return ONLY valid JSON
- No markdown, no extra text
- Parameters must match the action`;
};

// Main Groq Call Function
const getAIResponse = async (userPrompt, serverName) => {
  try {
    const systemPrompt = createStructuredPrompt(userPrompt, serverName);

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3, // Lower = more deterministic (better for structured output)
        max_tokens: 500,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    const tokensUsed = response.data.usage.total_tokens;

    // Parse JSON from response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      parsedResponse = {
        error: true,
        message: 'Invalid JSON response from AI',
        raw: aiResponse
      };
    }

    return {
      success: true,
      response: parsedResponse,
      tokensUsed: tokensUsed,
      rawResponse: aiResponse
    };
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

// Validate AI Response
const validateAIResponse = (response) => {
  if (response.error) {
    return {
      valid: false,
      reason: response.message
    };
  }

  // List of allowed actions
  const allowedActions = [
    'create_role',
    'delete_role',
    'create_channel',
    'delete_channel',
    'set_permissions',
    'ban_member',
    'kick_member'
  ];

  if (!allowedActions.includes(response.action)) {
    return {
      valid: false,
      reason: `Action "${response.action}" is not allowed`
    };
  }

  if (!response.parameters || typeof response.parameters !== 'object') {
    return {
      valid: false,
      reason: 'Missing or invalid parameters'
    };
  }

  return {
    valid: true
  };
};

module.exports = {
  getAIResponse,
  createStructuredPrompt,
  validateAIResponse
};