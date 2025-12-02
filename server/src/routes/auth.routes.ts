import { Router } from 'express';
import * as Auth from '../services/auth.service';

const router = Router();

router.post('/signup', Auth.signup);
router.post('/login', Auth.login);
router.post('/google', Auth.google);
router.post('/google-oauth', Auth.googleOAuth);
router.get('/me', Auth.me);
router.post('/logout', Auth.logout);
router.post('/refresh', Auth.refresh);
router.post('/verify-email', Auth.verifyEmail);

export default router;
