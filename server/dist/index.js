"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const prisma_1 = require("./prisma");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
// Compute allowed origins from env (comma-separated)
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Google auth iframe) and explicit allowlist
        if (!origin || allowedOrigins.includes(origin) || origin?.includes('google.com')) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ['Set-Cookie'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/auth', auth_routes_1.default);
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.get('/debug/users', async (_req, res) => {
    const users = await prisma_1.prisma.user.findMany({ select: { id: true, email: true, role: true, passwordHash: true } });
    res.json({ users, count: users.length });
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Auth server running on port ${port}`);
});
