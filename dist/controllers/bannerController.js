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
exports.BannerController = void 0;
const banner_schema_1 = require("../models/banner.schema");
const digitalOceanSpaces_1 = require("../utils/digitalOceanSpaces");
class BannerController {
    constructor() {
        this.getBanner = (request, response) => __awaiter(this, void 0, void 0, function* () {
            const banner = yield banner_schema_1.Banner.findOne();
            return response.status(200).json({
                status: 'success',
                data: banner
            });
        });
        this.createBanner = (request, response) => __awaiter(this, void 0, void 0, function* () {
            try {
                let images = [];
                let videoPath = null;
                const bannerExist = yield banner_schema_1.Banner.findOne();
                if (request.body.type === "image") {
                    for (let i = 0; i < request.body.images.length; i++) {
                        const image = request.body.images[i];
                        if (image) {
                            if (image.includes(';base64,')) {
                                let base64Image = image.split(';base64,').pop();
                                const imagePath = yield (0, digitalOceanSpaces_1.digitalOceanUpload)(base64Image);
                                images.push(`${process.env.CDN_ENDPOINT}/${imagePath}`);
                            }
                            else {
                                images.push(image);
                            }
                        }
                    }
                    if (!bannerExist) {
                        const banner = yield banner_schema_1.Banner.create({
                            type: request.body.type,
                            secondaryTexts: [
                                request.body.secondaryText1, request.body.secondaryText2, request.body.secondaryText3
                            ],
                            mainTexts: [
                                request.body.mainText1, request.body.mainText2, request.body.mainText3
                            ],
                            images: images
                        });
                    }
                    else {
                        yield bannerExist.updateOne({
                            type: request.body.type,
                            secondaryTexts: [
                                request.body.secondaryText1, request.body.secondaryText2, request.body.secondaryText3
                            ],
                            mainTexts: [
                                request.body.mainText1, request.body.mainText2, request.body.mainText3
                            ],
                            images: images
                        });
                    }
                }
                else {
                    const video = request.body.video;
                    if (video) {
                        if (video.includes(';base64,')) {
                            let base64Video = video.split(';base64,').pop();
                            videoPath = yield (0, digitalOceanSpaces_1.digitalOceanUpload)(base64Video);
                        }
                        else {
                            videoPath = video;
                        }
                    }
                    if (!bannerExist) {
                        const banner = yield banner_schema_1.Banner.create({
                            type: request.body.type,
                            video: `${process.env.CDN_ENDPOINT}/${videoPath}`,
                        });
                    }
                    else {
                        yield bannerExist.updateOne({
                            type: request.body.type,
                            video: `${process.env.CDN_ENDPOINT}/${videoPath}`,
                        });
                    }
                }
                return response.status(200).json({
                    status: 'success'
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.BannerController = BannerController;
