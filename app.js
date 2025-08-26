import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import connecttoDB from "./database/db.js";
import challengeRoute from "./routes/challenge.route.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/challenges", challengeRoute);

app.listen(PORT, async () => {
  await connecttoDB();
  console.log(`Server is running on port ${PORT}`);
});
