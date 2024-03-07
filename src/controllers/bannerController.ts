import { Request, Response } from "express";
import { Banner } from "../models/banner.schema";
import { digitalOceanUpload } from "../utils/digitalOceanSpaces";

export class BannerController {

    public createBanner = async(request:Request, response:Response) =>{

        try{

            let images:Array<String> = []
            let videoPath: string | null = null;

            if(request.body.type === "image"){
            
                for(let i = 0; i < request.body.images.length; i++) {
                    const image = request.body.images[i];
                    let base64Image = image.split(';base64,').pop();

                    const imagePath: any = await digitalOceanUpload(base64Image)
                    images.push(`${process.env.CDN_ENDPOINT}/${imagePath}`);
                }
            }

            else {
                const video = request.body.video;
                let base64Video = video.split(';base64,').pop();
                const videoPath: any = await digitalOceanUpload(base64Video)
            }
            
            const banner = await Banner.create({
                type: request.body.type,
                secondaryTexts: request.body.secondaryTexts,
                mainTexts: request.body.mainTexts,
                video: videoPath,
                images: images
            })


        }catch(error){

            console.log(error)

        }

    } 

}