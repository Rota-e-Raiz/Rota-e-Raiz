import { Router } from "express";
import { UserController } from "./UserController.js";
import { validate } from "./validateMiddleware.js";
import { createUserSchema } from "./userSchema.js";

const routes = Router();

// Rota GET
routes.get("/users", UserController.index);

// ROTA POST (VERIFIQUE SE ESTÁ ESCRITA ASSIM):
routes.post("/users", validate(createUserSchema), UserController.create);

export default routes;