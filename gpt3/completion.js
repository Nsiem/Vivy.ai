const { Configuration, OpenAIApi } = require("openai");
const dotenv = require('dotenv')
dotenv.config()
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

openai.createCompletion("text-curie-001", {
    prompt: "How are you? I am doing good",
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: ["Human:", "AI:"],

}).then((response) => {
    console.log(response.data)
})
