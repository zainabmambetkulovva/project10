"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = env_1.config.port;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(env_1.config.cors));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)(env_1.config.sessionSecret));
if (env_1.config.nodeEnv !== 'production') {
    app.use((0, morgan_1.default)('dev'));
}
app.use('/api', routes_1.default);
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ronin-backend',
        timestamp: new Date().toISOString(),
    });
});
