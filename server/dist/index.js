"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const customizableProducts_routes_1 = __importDefault(require("./routes/customizableProducts.routes"));
const cloudinary_routes_1 = __importDefault(require("./routes/cloudinary.routes"));
const canvasResources_routes_1 = __importDefault(require("./routes/canvasResources.routes"));
const userDesign_routes_1 = __importDefault(require("./routes/userDesign.routes"));
const savedDesigns_routes_1 = __importDefault(require("./routes/savedDesigns.routes"));
const customDesign_routes_1 = __importDefault(require("./routes/customDesign.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const favorites_routes_1 = __importDefault(require("./routes/favorites.routes"));
const payments_routes_1 = __importDefault(require("./routes/payments.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const cashflow_routes_1 = __importDefault(require("./routes/cashflow.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const catalogProducts_routes_1 = __importDefault(require("./routes/catalogProducts.routes"));
const app = (0, express_1.default)();
// Simple CORS - allow frontend origins
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/auth', auth_routes_1.default);
app.use('/api/customizable-products', customizableProducts_routes_1.default);
app.use('/api/cloudinary', cloudinary_routes_1.default);
app.use('/api/canvas-resources', canvasResources_routes_1.default);
app.use('/api/design', userDesign_routes_1.default);
app.use('/api/saved-designs', savedDesigns_routes_1.default);
app.use('/api/custom-design', customDesign_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/favorites', favorites_routes_1.default);
app.use('/api/payments', payments_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/cashflow', cashflow_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/catalog-products', catalogProducts_routes_1.default);
app.get('/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});
// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`✅ Auth server running on http://localhost:${port}`);
    console.log(`📝 Allowed origins: ${allowedOrigins.join(', ')}`);
}).on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});
// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
