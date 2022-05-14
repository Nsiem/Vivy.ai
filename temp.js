const { Configuration, OpenAIApi } = require("openai");
const dotenv = require('dotenv')
dotenv.config()

const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY})
const openai = new OpenAIApi(configuration)



async function getCompletion() {
    openai.createCompletion("text-curie-001", {
        prompt: "The following is a conversation with an AI named Vivy. The AI is interesting, creative, clever, intelligent, and very friendly.\n\nHuman: Hello, who are you?\nAI: Hi I'm an AI named Vivy!\nHuman: How are you?\nAI:I'm excellent, thanks for asking!\nHuman:What was your name again?\nAI: Vivy!\nHuman: Nice to meet you Vivy, my name is Tony\nAI:",
        temperature: 0.9,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
      }).then((response) => {
          return response.data
      })
}

module.exports = {getCompletion}