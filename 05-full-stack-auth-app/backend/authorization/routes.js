import express from "express";
import { register, login } from "./controller.js";

const router = express.Router();

console.log(register);
router.post('/signup', register);
router.post('/login', login);

export default router;