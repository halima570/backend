const express=require('express')
const dotenv=require("dotenv");
const cors=require("cors");
const { Configuration, OpenAIApi } = require("openai");
const app = express();

app.use(cors());

require("./index");
dotenv.config();
require("./rss");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello from codex");console.log('wata ban');
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


app.listen(5000, () => {
  console.log(` server on http://localhost:5000/`);
});
