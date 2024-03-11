import { Request, Response } from "express";
import { Banner } from "../models/banner.schema";
import { digitalOceanUpload } from "../utils/digitalOceanSpaces";

export class BannerController {

    public getBanner = async(request: Request, response: Response) => {
        const banner = await Banner.findOne();

        return response.status(200).json({
            status: 'success',
            data: banner
        })
    }

    public createBanner = async(request:Request, response:Response) =>{

        try{

            let images:Array<String> = []
            let videoPath: string | null = null;

            const bannerExist = await Banner.findOne();

            if(request.body.type === "image"){
            
                for(let i = 0; i < request.body.images.length; i++) {
                    const image = request.body.images[i];
                    if(image){
                        if(image.includes(';base64,')){
                            let base64Image = image.split(';base64,').pop();
    
                            const imagePath: any = await digitalOceanUpload(base64Image)
                            images.push(`${process.env.CDN_ENDPOINT}/${imagePath}`);
                        }else{
                            images.push(image);
                        }  
                    } 
                       
                }

                if(!bannerExist){
                    const banner = await Banner.create({
                        type: request.body.type,
                        secondaryTexts: [
                            request.body.secondaryText1, request.body.secondaryText2, request.body.secondaryText3
                        ],
                        mainTexts: [
                            request.body.mainText1, request.body.mainText2, request.body.mainText3
                        ],
                        images: images
                    })
                }else{
                    await bannerExist.updateOne({
                        type: request.body.type,
                        secondaryTexts: [
                            request.body.secondaryText1, request.body.secondaryText2, request.body.secondaryText3
                        ],
                        mainTexts: [
                            request.body.mainText1, request.body.mainText2, request.body.mainText3
                        ],
                        images: images
                    })
                }
                
            }

            else {
                const video = request.body.video;
                if(video){
                    if(video.includes(';base64,')){
                        let base64Video = video.split(';base64,').pop();
                        videoPath = await digitalOceanUpload(base64Video)
                    }else{
                        videoPath = video;
                    }
                }

                if(!bannerExist){
                    const banner = await Banner.create({
                        type: request.body.type,
                        video: `${process.env.CDN_ENDPOINT}/${videoPath}`,
                    })
                }else{
                    await bannerExist.updateOne({
                        type: request.body.type,
                        video: `${process.env.CDN_ENDPOINT}/${videoPath}`,
                    })
                }
                
            }
        

            return response.status(200).json({
                status: 'success'
            })


        }catch(error){

            console.log(error)

        }

    } 

}