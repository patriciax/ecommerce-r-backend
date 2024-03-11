"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoomController = void 0;
const axios_1 = __importDefault(require("axios"));
class ZoomController {
    constructor() {
        this.getStates = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const response = yield axios_1.default.get(`${process.env.ZOOM_API_URL}/getEstados`);
                if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.codrespuesta) === 'COD_000') {
                    return res.status(400).json({
                        status: 'success',
                        data: (_b = response.data) === null || _b === void 0 ? void 0 : _b.entidadRespuesta
                    });
                }
                else {
                    return res.status(400).json({
                        status: 'fail',
                        message: 'SOMETHING WENT WRONG'
                    });
                }
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: 'SOMETHING WENT WRONG'
                });
            }
        });
        this.getOffices = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            try {
                const response = yield axios_1.default.get(`${process.env.ZOOM_API_URL}/getOficinaEstadoWs?codestado=${req.params.state}`);
                if (((_c = response.data) === null || _c === void 0 ? void 0 : _c.codrespuesta) === 'COD_000') {
                    return res.status(400).json({
                        status: 'success',
                        data: (_d = response.data) === null || _d === void 0 ? void 0 : _d.entidadRespuesta
                    });
                }
                else {
                    return res.status(400).json({
                        status: 'fail',
                        message: 'SOMETHING WENT WRONG'
                    });
                }
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({
                    status: 'error',
                    message: 'SOMETHING WENT WRONG'
                });
            }
        });
        this.getTracking = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _e, _f;
            try {
                const response = yield axios_1.default.get(`${process.env.ZOOM_API_URL}/getInfoTracking?tipo_busqueda=1&codigo=${req.params.tracking}&codigo_cliente=${process.env.ZOOM_CLIENT}`);
                if (((_e = response.data) === null || _e === void 0 ? void 0 : _e.codrespuesta) === 'COD_000') {
                    return res.status(400).json({
                        status: 'success',
                        data: (_f = response.data) === null || _f === void 0 ? void 0 : _f.entidadRespuesta
                    });
                }
                else {
                    return res.status(400).json({
                        status: 'fail',
                        message: 'SOMETHING WENT WRONG'
                    });
                }
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({
                    status: 'error',
                    message: 'SOMETHING WENT WRONG'
                });
            }
        });
    }
}
exports.ZoomController = ZoomController;
