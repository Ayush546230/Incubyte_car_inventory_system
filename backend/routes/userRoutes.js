import express from 'express'
import { adminLogin, login, register, getProfile } from '../controllers/userController.js';
import authMiddleware from '../middlewares/auth.js';

const userRouter = express.Router();
userRouter.post('/login', login);
userRouter.post('/register', register);
userRouter.post('/admin-login', adminLogin);
userRouter.get('/me', authMiddleware, getProfile);

export default userRouter;
