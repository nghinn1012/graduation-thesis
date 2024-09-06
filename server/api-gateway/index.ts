import express, { Express } from "express";
import cors from "cors";
import { PORT } from "./src/config";
import { withProxy } from "./src/config_proxy";
import path from "path";

const app: Express = express();

app.use(cors());
app.use(
  express.json({
    limit: "800000kb",
  })
);
withProxy(app);
app.use(express.static("./client"));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Gateway is Listening to Port ${PORT}`);
});
