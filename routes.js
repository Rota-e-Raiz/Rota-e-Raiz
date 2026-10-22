import { Router } from "express";
import { UserController } from "./controllers/UserController.js";
import { validate } from "./middlewares/validateMiddleware.js";
import { createUserSchema } from "./schemas/userSchema.js";

const routes = Router();

// Rota GET
routes.get("/users", UserController.index);

// ROTA POST (VERIFIQUE SE ESTÁ ESCRITA ASSIM):
routes.post("/users", validate(createUserSchema), UserController.create);

export default routes;