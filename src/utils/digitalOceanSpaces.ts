import AWS from "aws-sdk";
import fs from "fs/promises";

const decodeBase64mimetype = (base64:string) =>{
    const signatures:any = {
        JVBERi0: 'pdf',
        R0lGODdh: 'gif',
        R0lGODlh: 'gif',
        iVBORw0KGgo: 'png',
        '/9j/': 'jpg',
    };
    
    for(const sign in signatures)
        if(base64.startsWith(sign))
            return signatures[sign];
    
}

const uploadDataPromise = async (file: any, name:string, mimetype: string) => {

    const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT || '');
    const s3 = new AWS.S3({endpoint: spacesEndpoint, accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});

    return new Promise((resolve, reject)=> {
        s3.putObject({Bucket: process.env.DO_SPACES_NAME || '', Key: name, Body: file, ACL: "public-read"}, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    })

    
}

const digitalOceanSpaces = async (file: any, name:string, mimetype:string) => {

    await uploadDataPromise(file, name, mimetype);
    return `${name}`

}

export const digitalOceanUpload = async (base64Image:string) =>{
    const mimeType = decodeBase64mimetype(base64Image) 
    const fileName = Date.now()

    await fs.writeFile(`uploads/${fileName}.${mimeType}`, base64Image, {encoding: 'base64'});
    const file = await fs.readFile(`uploads/${fileName}.${mimeType}`);
    const imagePath = await digitalOceanSpaces(file, fileName.toString(), mimeType);
    return imagePath
}