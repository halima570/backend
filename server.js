const express=require('express')
const dotenv=require("dotenv");
const cors=require("cors");
const { Configuration, OpenAIApi } = require("openai");
require("./index");
dotenv.config();
require("./rss");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send({
    message: "hello from codex",
  });
});

app.post("/", async (req, res) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${req.body.text}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    res.status(200).send({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});


app.listen(process.env.PORT || 5000, () => {
  console.log(` server on http://localhost:5000/`);
});