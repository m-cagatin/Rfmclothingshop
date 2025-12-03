"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.google = google;
exports.googleOAuth = googleOAuth;
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
// Constants
const ACCESS_TTL = '15m';
const REFRESH_TTL = '30d';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-me-refresh';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID) : null;
// Validation schemas
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const googleSchema = zod_1.z.object({
    idToken: zod_1.z.string().min(10),
});
// Helper functions
function generateId() {
    return crypto_1.default.randomBytes(16).toString('hex');
}
function generateTokens(userId, role) {
    const access = jsonwebtoken_1.default.sign({ sub: userId, role }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
    const refresh = jsonwebtoken_1.default.sign({ sub: userId, role }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
    return { access, refresh };
}
function setAuthCookies(res, access, refresh) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access', access, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh', refresh, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
}
function clearAuthCookies(res) {
    res.clearCookie('access');
    res.clearCookie('refresh');
}
async function saveRefreshToken(userId, token) {
    const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await prisma_1.prisma.refreshToken.create({
        data: {
            id: generateId(),
            userId,
            tokenHash,
            expiresAt,
        },
    });
}
function toSafeUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profilePicture: user.profilePicture,
        googleId: user.googleId,
    };
}
// Route handlers
async function signup(req, res) {
    try {
        const parse = signupSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({
                error: parse.error.errors[0]?.message || 'Invalid input'
            });
        }
        const { name, email, phone, password } = parse.data;
        // Check if user exists
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        // Hash password and create user
        const passwordHash = await argon2_1.default.hash(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                id: generateId(),
                name,
                email,
                phone: phone || null,
                passwordHash,
                role: 'customer', // Always customer for signup
                emailVerified: true, // Auto-verify for now
            },
        });
        // Generate tokens
        const { access, refresh } = generateTokens(user.id, user.role);
        await saveRefreshToken(user.id, refresh);
        setAuthCookies(res, access, refresh);
        return res.status(201).json({
            success: true,
            user: toSafeUser(user)
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Signup failed' });
    }
}
async function login(req, res) {
    try {
        const parse = loginSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'Invalid input' });
        }
        const { email, password } = parse.data;
        // Find user
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Verify password
        const valid = await argon2_1.default.verify(user.passwordHash, password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate tokens
        const { access, refresh } = generateTokens(user.id, user.role);
        await saveRefreshToken(user.id, refresh);
        setAuthCookies(res, access, refresh);
        return res.json({
            success: true,
            user: toSafeUser(user)
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
}
async function google(req, res) {
    try {
        if (!googleClient || !GOOGLE_CLIENT_ID) {
            console.error('[Google Auth] Google client not configured');
            return res.status(500).json({ error: 'Google Sign-In not configured' });
        }
        const parse = googleSchema.safeParse(req.body);
        if (!parse.success) {
            console.error('[Google Auth] Invalid token format:', parse.error);
            return res.status(400).json({ error: 'Invalid Google token' });
        }
        console.log('[Google Auth] Verifying token...');
        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: parse.data.idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log('[Google Auth] Token verified, email:', payload?.email);
        console.log('[Google Auth] Full payload:', {
            email: payload?.email,
            name: payload?.name,
            given_name: payload?.given_name,
            family_name: payload?.family_name,
            picture: payload?.picture,
            locale: payload?.locale,
            sub: payload?.sub, // Google User ID
        });
        if (!payload || !payload.email) {
            console.error('[Google Auth] No email in payload');
            return res.status(400).json({ error: 'Invalid Google token' });
        }
        if (!payload.email_verified) {
            console.error('[Google Auth] Email not verified');
            return res.status(400).json({ error: 'Google email not verified' });
        }
        const email = payload.email;
        const name = payload.name || email.split('@')[0];
        const googleUserId = payload.sub; // Unique Google ID
        const profilePicture = payload.picture; // Profile image URL
        // Find or create user
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('[Google Auth] Creating new user:', email);
            user = await prisma_1.prisma.user.create({
                data: {
                    id: generateId(),
                    name,
                    email,
                    passwordHash: null, // No password for Google users
                    phone: null,
                    role: 'customer',
                    emailVerified: true,
                    googleId: googleUserId,
                    profilePicture: profilePicture || null,
                },
            });
        }
        else {
            console.log('[Google Auth] User exists:', email);
            // Update Google data if not set
            if (!user.googleId || !user.profilePicture) {
                user = await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleUserId,
                        profilePicture: profilePicture || user.profilePicture,
                    },
                });
            }
        }
        // Generate tokens
        const { access, refresh } = generateTokens(user.id, user.role);
        await saveRefreshToken(user.id, refresh);
        setAuthCookies(res, access, refresh);
        console.log('[Google Auth] Success, user role:', user.role);
        return res.json({
            success: true,
            user: toSafeUser(user)
        });
    }
    catch (error) {
        console.error('[Google Auth] Error:', error.message);
        console.error('[Google Auth] Stack:', error.stack);
        return res.status(500).json({ error: 'Google Sign-In failed: ' + error.message });
    }
}
// Alternative OAuth2 endpoint (no ID token verification needed)
async function googleOAuth(req, res) {
    try {
        const { email, name, picture, sub } = req.body;
        if (!email || !sub) {
            return res.status(400).json({ error: 'Invalid Google user data' });
        }
        console.log('[Google OAuth] User:', email);
        // Find or create user
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('[Google OAuth] Creating new user:', email);
            user = await prisma_1.prisma.user.create({
                data: {
                    id: generateId(),
                    name: name || email.split('@')[0],
                    email,
                    passwordHash: null,
                    phone: null,
                    role: 'customer',
                    emailVerified: true,
                    googleId: sub,
                    profilePicture: picture || null,
                },
            });
        }
        else {
            console.log('[Google OAuth] User exists:', email);
            // Update Google data
            if (!user.googleId || !user.profilePicture) {
                user = await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: sub,
                        profilePicture: picture || user.profilePicture,
                    },
                });
            }
        }
        // Generate tokens
        const { access, refresh } = generateTokens(user.id, user.role);
        await saveRefreshToken(user.id, refresh);
        setAuthCookies(res, access, refresh);
        console.log('[Google OAuth] Success, user role:', user.role);
        return res.json({
            success: true,
            user: toSafeUser(user)
        });
    }
    catch (error) {
        console.error('[Google OAuth] Error:', error.message);
        return res.status(500).json({ error: 'Google Sign-In failed: ' + error.message });
    }
}
async function me(req, res) {
    try {
        const token = req.cookies?.access;
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.sub } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        return res.json({ user: toSafeUser(user) });
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.refresh;
        if (refreshToken) {
            const tokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
            await prisma_1.prisma.refreshToken.updateMany({
                where: { tokenHash, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        clearAuthCookies(res);
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Logout error:', error);
        clearAuthCookies(res);
        return res.json({ success: true });
    }
}
async function refresh(req, res) {
    try {
        const refreshToken = req.cookies?.refresh;
        if (!refreshToken) {
            return res.status(401).json({ error: 'No refresh token' });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
        const tokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        const stored = await prisma_1.prisma.refreshToken.findFirst({
            where: { tokenHash, userId: decoded.sub, revokedAt: null },
        });
        if (!stored || stored.expiresAt < new Date()) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        // Revoke old token
        await prisma_1.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        // Issue new tokens
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.sub } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const { access, refresh: newRefresh } = generateTokens(user.id, user.role);
        await saveRefreshToken(user.id, newRefresh);
        setAuthCookies(res, access, newRefresh);
        return res.json({
            success: true,
            user: toSafeUser(user)
        });
    }
    catch (error) {
        console.error('Refresh error:', error);
        return res.status(401).json({ error: 'Refresh failed' });
    }
}
async function verifyEmail(_req, res) {
    return res.status(501).json({ error: 'Email verification not implemented yet' });
}
