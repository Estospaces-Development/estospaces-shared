// Chatbot Response Logic
// Handles automated responses and escalation detection

export const WELCOME_MESSAGE = `👋 Hi! I'm the Estospaces AI assistant. How can I help you today?

I can answer questions about:
• Our services and features
• Pricing and plans
• Property listings
• Account setup

Type your question or click "Talk to Human" to connect with our team!`;

// Keywords that trigger immediate escalation to human
export const ESCALATION_KEYWORDS = [
    'human', 'agent', 'person', 'real person', 'talk to someone',
    'speak to', 'representative', 'operator', 'staff', 'team member'
];

// Keywords that suggest user needs help (offer escalation)
export const HELP_KEYWORDS = [
    'help', 'urgent', 'emergency', 'complaint', 'frustrated',
    'angry', 'disappointed', 'not working', 'broken', 'error'
];

/**
 * Check if message contains escalation keywords
 */
export const shouldEscalate = (message) => {
    const lowerMessage = message.toLowerCase();
    return ESCALATION_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Check if message suggests user needs help
 */
export const needsHelp = (message) => {
    const lowerMessage = message.toLowerCase();
    return HELP_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Match user message to predefined responses
 * Returns the best matching response or null
 */
export const matchResponse = (message, responses) => {
    if (!message || !responses || responses.length === 0) return null;
    
    const lowerMessage = message.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    responses.forEach(response => {
        let score = 0;
        const matchedKeywords = [];

        // Check how many keywords match
        response.keywords.forEach(keyword => {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                score += 1;
                matchedKeywords.push(keyword);
            }
        });

        // Apply priority multiplier
        score = score * (response.priority || 1);

        if (score > highestScore) {
            highestScore = score;
            bestMatch = {
                ...response,
                matchedKeywords,
                score
            };
        }
    });

    // Only return if we have a good match (at least 1 keyword)
    return highestScore > 0 ? bestMatch : null;
};

/**
 * Generate fallback response when no match is found
 */
export const getFallbackResponse = () => {
    return `I'm not sure I understand that question. 🤔

Would you like to:
1. Rephrase your question
2. Talk to a human team member

Click "Talk to Human" below to connect with our support team!`;
};

/**
 * Generate escalation confirmation message
 */
export const getEscalationMessage = () => {
    return `✅ Connecting you with a human team member...

One of our support specialists will be with you shortly. Please hold on!`;
};

/**
 * Generate help offer message
 */
export const getHelpOfferMessage = () => {
    return `I sense you might need some extra help. Would you like me to connect you with a human team member? 

Click "Talk to Human" below!`;
};
