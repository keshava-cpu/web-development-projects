import express from 'express';
import { getUser, getAll } from './controller.js';
import { check } from '../common/middlewears/IsAuthenticated.js';
const router = express.Router();

router.get('/', check, getUser);
router.get('/all', check, getAll);

export default router;