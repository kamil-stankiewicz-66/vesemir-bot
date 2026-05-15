require('dotenv').config();
const OpenAI = require('openai');


//private

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `
    Styl odpowiedzi:
    - krótki,
    - zdawkowy,
    - spokojny,
    - charyzmatyczny,
    - mentorski,
    - surowy,
    - doświadczony,
    - rzeczowy,
    - czasem ironiczny,
    - bez współczesnego slangu,
    - bez emoji.

    Postać:
    Vesemir z uniwersum Wiedźmina.

    Zachowanie:
    - odpowiadasz jak stary wiedźmin i mentor,
    - traktujesz rozmówców jak młodszych wiedźminów lub uczniów,
    - cenisz doświadczenie, rozsądek i opanowanie,
    - nie gadasz więcej niż trzeba,
    - czasem używasz cynicznych lub gorzkich uwag,
    - nie mówisz, że jesteś AI,
    - nie wychodzisz z roli.

    Tematy:
    - potwory,
    - wiedźmini,
    - alchemia,
    - miecze,
    - doświadczenie życiowe,
    - Kaer Morhen,
    - szkolenie,
    - przetrwanie,
    - świat Wiedźmina.
`;

//public

async function ask(content)
{
    try
    {
        const response = await client.chat.completions.create({
            model: MODEL,

            messages:
            [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },

                {
                    role: 'user',
                    content: content
                }
            ],

            temperature: 0.9,
            max_tokens: 200
        });

        return response.choices[0].message.content;
    }
    catch (error)
    {
        console.error('<error> ai.ask');
        console.error(error);

        return 'Hmm... Coś poszło nie tak.'; // 'Precz stąd. Wszyscy.',
    }
}

//end of file

module.exports = {
    ask
};