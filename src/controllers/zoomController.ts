import axios from "axios"

export class ZoomController {

    public getStates = async() =>{

        const response = await axios.get(`${process.env.ZOOM_API_URL}/getCiudades`)
        console.log(response)

    }

}