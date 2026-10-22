import express from "express";
import routes from "./routes.js";

const app = express();

app.use(express.json()); // <-- OBRIGATÓRIO estar antes do routes
app.use(routes);

app.listen(3000, () => console.log("Servidor a rodar em http://localhost:3000"));