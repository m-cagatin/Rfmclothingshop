"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.google = google;
exports.me = me;
exports.logout = logout;
exports.refresh = refresh;
exports.verifyEmail = verifyEmail;
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const ACCESS_TTL_MS = 15 * 60 * 1000; // 15m
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30d
const isProd = process.env.NODE_ENV === 'production';
const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = googleClientId ? new google_auth_library_1.OAuth2Client(googleClientId) : null;
// Helper to generate IDs
function generateId() {
    return crypto_1.default.randomBytes(16).toString('hex');
}
// Validation schemas
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const googleSchema = zod_1.z.object({
    idToken: zod_1.z.string().min(10),
});
// Helper to send user payload (hide sensitive fields)
const toSafeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
});
async function signup(req, res) {
    const parse = signupSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
    }
    const { name, email, phone, password } = parse.data;
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await argon2_1.default.hash(password);
    const user = await prisma_1.prisma.user.create({
        data: {
            id: generateId(),
            name,
            email,
            phone,
            passwordHash,
            role: 'customer',
            // TODO: flip to false when email verification is wired
            emailVerified: true,
        },
    });
    const tokens = await issueTokens(user.id, user.role);
    await persistRefreshToken(user.id, tokens.refresh);
    setAuthCookies(res, tokens);
    // TODO: send verification email with token
    return res.status(201).json({ user: toSafeUser(user) });
}
async function login(req, res) {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
    }
    const { email, password } = parse.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    console.log('[LOGIN] User found:', user ? `${user.email} (has hash: ${!!user.passwordHash})` : 'NOT FOUND');
    if (!user || !user.passwordHash || !user.passwordHash.startsWith('$')) {
        console.log('[LOGIN] Failed - no user or invalid hash format');
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await argon2_1.default.verify(user.passwordHash, password);
    console.log('[LOGIN] Password valid:', valid);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    // TODO: enforce emailVerified check when verification is enabled
    const tokens = await issueTokens(user.id, user.role);
    await persistRefreshToken(user.id, tokens.refresh);
    setAuthCookies(res, tokens);
    return res.json({ user: toSafeUser(user) });
}
async function google(req, res) {
    const parse = googleSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Missing idToken' });
    }
    if (!googleClient || !googleClientId) {
        return res.status(500).json({ error: 'Google login not configured' });
    }
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: parse.data.idToken,
            audience: googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }
        if (!payload.email_verified) {
            return res.status(400).json({ error: 'Google email not verified' });
        }
        const email = payload.email;
        const name = payload.name || email.split('@')[0];
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    id: generateId(),
                    name,
                    email,
                    passwordHash: null,
                    phone: null,
                    role: 'customer',
                    emailVerified: true,
                },
            });
        }
        // If an existing password-based account exists, treat this as login (no duplicate creation)
        const tokens = await issueTokens(user.id, user.role);
        await persistRefreshToken(user.id, tokens.refresh);
        setAuthCookies(res, tokens);
        return res.json({ user: toSafeUser(user) });
    }
    catch (err) {
        console.error('Google login error', err);
        return res.status(401).json({ error: 'Google login failed' });
    }
}
async function me(req, res) {
    const userId = verifyAccessFromCookies(req, res);
    if (!userId)
        return;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({ user: toSafeUser(user) });
}
async function logout(req, res) {
    const refreshToken = req.cookies?.refresh;
    if (refreshToken) {
        const hash = hashToken(refreshToken);
        await prisma_1.prisma.refreshToken.updateMany({
            where: { tokenHash: hash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    clearAuthCookies(res);
    return res.json({ ok: true });
}
async function refresh(req, res) {
    const refreshToken = req.cookies?.refresh;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev_refresh');
        const hashed = hashToken(refreshToken);
        const stored = await prisma_1.prisma.refreshToken.findFirst({
            where: {
                tokenHash: hashed,
                userId: decoded.sub,
                revokedAt: null,
            },
        });
        if (!stored) {
            return res.status(401).json({ error: 'Refresh token invalid' });
        }
        if (stored.expiresAt.getTime() < Date.now()) {
            await prisma_1.prisma.refreshToken.updateMany({
                where: { id: stored.id },
                data: { revokedAt: new Date() },
            });
            return res.status(401).json({ error: 'Refresh token expired' });
        }
        // Rotate: revoke old and issue new
        await prisma_1.prisma.refreshToken.updateMany({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.sub } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const tokens = await issueTokens(user.id, user.role);
        await persistRefreshToken(user.id, tokens.refresh);
        setAuthCookies(res, tokens);
        return res.json({ user: toSafeUser(user) });
    }
    catch (err) {
        return res.status(401).json({ error: 'Refresh failed' });
    }
}
async function verifyEmail(_req, res) {
    // TODO: implement email verification token consumption
    return res.status(501).json({ error: 'Verify email not implemented yet' });
}
// Helpers
async function issueTokens(userId, role) {
    const access = jsonwebtoken_1.default.sign({ sub: userId, role }, process.env.JWT_ACCESS_SECRET || 'dev_access', {
        expiresIn: Math.floor(ACCESS_TTL_MS / 1000),
    });
    const refresh = jsonwebtoken_1.default.sign({ sub: userId, role }, process.env.JWT_REFRESH_SECRET || 'dev_refresh', {
        expiresIn: Math.floor(REFRESH_TTL_MS / 1000),
    });
    return { access, refresh };
}
async function persistRefreshToken(userId, refreshToken) {
    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
    const tokenHash = hashToken(refreshToken);
    await prisma_1.prisma.refreshToken.create({
        data: {
            id: generateId(),
            userId,
            tokenHash,
            expiresAt,
        },
    });
}
function setAuthCookies(res, tokens) {
    res.cookie('access', tokens.access, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: ACCESS_TTL_MS,
    });
    res.cookie('refresh', tokens.refresh, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: REFRESH_TTL_MS,
    });
}
function clearAuthCookies(res) {
    res.clearCookie('access');
    res.clearCookie('refresh');
}
function verifyAccessFromCookies(req, res) {
    const token = req.cookies?.access;
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_access');
        return decoded.sub;
    }
    catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
}
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
