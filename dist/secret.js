"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoDbUrl = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { MONGODB_URL, } = process.env;
if (!MONGODB_URL) {
    throw new Error('Missing MONGODB_URL environment variable');
}
exports.mongoDbUrl = MONGODB_URL;
