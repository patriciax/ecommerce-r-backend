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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const shippo_1 = require("shippo");
class ShipmentController {
    constructor() {
        this.getRates = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.setAPI();
                const addressFrom = {
                    "name": "Shawn Ippotle",
                    "street1": "215 Clayton St.",
                    "city": "San Francisco",
                    "state": "CA",
                    "zip": "94117",
                    "country": "US"
                };
                // const addressTo = {
                //     "name": "Mr Hippo",
                //     "street1": "Broadway 1",
                //     "city": "New York",
                //     "state": "NY",
                //     "zip": "10007",
                //     "country": "US"
                // };
                const addressTo = {
                    "name": req.body.name,
                    "street1": req.body.street1,
                    "city": req.body.city,
                    "state": req.body.state,
                    "zip": req.body.zip,
                    "country": req.body.country
                };
                const parcel = [];
                req.body.parcel.forEach((item) => {
                    for (let i = 0; i < item.quantity; i++) {
                        parcel.push({
                            "metadata": `${item.nameEnglish} - ${item.color.englishName} - ${item.size.englishName}`,
                            "length": `${item.length}`,
                            "width": `${item.width}`,
                            "height": `${item.height}`,
                            "distanceUnit": "cm",
                            "weight": `${item.weight}`,
                            "massUnit": "kg"
                        });
                    }
                });
                // console.log({
                //     "addressFrom": addressFrom,
                //     "addressTo": addressTo,
                //     "parcels": parcel,
                //     "carrierAccounts": [
                //         process.env.CARRIER_ACCOUNT
                //     ],
                // })
                const response = yield this.shippoClient.shipments.create({
                    "addressFrom": addressFrom,
                    "addressTo": addressTo,
                    "parcels": parcel
                });
                return res.status(200).json({
                    status: 'success',
                    data: response.rates
                });
            }
            catch (err) {
                return res.status(500).json({ message: err.message });
            }
        });
        this.createShipment = (rateId) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.setAPI();
                const response = yield this.shippoClient.transactions.create({
                    "rate": rateId,
                    "label_file_type": "PDF",
                    "async": false
                });
                return response;
            }
            catch (err) {
                console.log(err);
                return {
                    status: 'error'
                };
            }
        });
    }
    setAPI() {
        this.shippoClient = new shippo_1.Shippo({
            apiKeyHeader: process.env.SHIPPO_API,
            shippoApiVersion: "2018-02-08",
        });
    }
}
exports.ShipmentController = ShipmentController;
