import cloudinary from 'cloudinary'

export const initCloudinary = () => {
    cloudinary.v2.config({
        cloud_name: 'dzrkonvpo',
        api_key: '261881846577638',
        api_secret: 'ai694HK_OEf6AKWxbfHblO5F8GU',
    })
}