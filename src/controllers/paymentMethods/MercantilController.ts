import  {createHash, createCipheriv, createDecipheriv}  from 'crypto';

export class MercantilController {

    private OPENSSL_CIPHER_NAME = "aes-128-ecb";
    private CIPHER_KEY_LEN = 16;

    private createKeyhash = (keybank:String) => {

        const keyBankUTF8 = Buffer.from(keybank, "utf8");
        const keyBankHash = createHash("sha256").update(keyBankUTF8).digest("binary");
 
        return keyBankHash;
    }

    private str_pad(input:string, length:number, padString:string) {
        input = input.toString();
        while (input.length < length) {
            input = padString + input;
        }
        return input;
    }

    private fixKey = (key:string) => {
        
        if (key.length < this.CIPHER_KEY_LEN) {
            key = this.str_pad(key, this.CIPHER_KEY_LEN, "0"); 
        }
        
        if (key.length > this.CIPHER_KEY_LEN) {
            //truncate to 16 bytes
            key =  key.slice(0, this.CIPHER_KEY_LEN);; 
        }

        return key;
    }

    private encrypt(key:any, data:any) {

        const cipher = createCipheriv(this.OPENSSL_CIPHER_NAME, key, '');
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const base64Encoded = Buffer.from(encrypted, 'base64').toString('base64');

        return base64Encoded;
        
    }

    private decrypt(key:any, data:any) {
        
        const decodedData = Buffer.from(data, 'base64').toString('binary');
        const decipher = createDecipheriv(this.OPENSSL_CIPHER_NAME, key, '');
        let decrypted = decipher.update(decodedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;

        
    }

}