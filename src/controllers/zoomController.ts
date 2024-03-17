import axios from "axios"
import { Request, Response } from "express"

export class ZoomController {

    public getStates = async(req:Request, res:Response) =>{

        try{

            const response = await axios.get(`${process.env.ZOOM_API_URL}/getEstados`)
            if(response.data?.codrespuesta === 'COD_000'){
                
                return res.status(200).json({
                    status:'success',
                    data: response.data?.entidadRespuesta
                })

            }else{
                return res.status(400).json({
                    status:'fail',
                    message:'SOMETHING WENT WRONG'
                })
            }


        }catch(error){
            return res.status(500).json({
                status:'error',
                message:'SOMETHING WENT WRONG'
            })
        }
    }

    public getOffices = async(req:Request, res:Response) =>{

        try{

            const response = await axios.get(`${process.env.ZOOM_API_URL}/getOficinaEstadoWs?codestado=${req.params.state}`)
            if(response.data?.codrespuesta === 'COD_000'){
                
                return res.status(200).json({
                    status:'success',
                    data: response.data?.entidadRespuesta
                })

            }else{
                return res.status(400).json({
                    status:'fail',
                    message:'SOMETHING WENT WRONG'
                })
            }


        }catch(error){

            console.log(error)

            return res.status(500).json({
                status:'error',
                message:'SOMETHING WENT WRONG'
            })
        }
    }

    public getTracking = async(req:Request, res:Response) =>{

        try{

            const response = await axios.get(`${process.env.ZOOM_API_URL}/getInfoTracking?tipo_busqueda=1&codigo=${req.params.tracking}&codigo_cliente=${process.env.ZOOM_CLIENT}`)
            if(response.data?.codrespuesta === 'COD_000'){
                
                return res.status(200).json({
                    status:'success',
                    data: response.data?.entidadRespuesta
                })

            }else{
                return res.status(400).json({
                    status:'fail',
                    message:'SOMETHING WENT WRONG'
                })
            }


        }catch(error){

            console.log(error)

            return res.status(500).json({
                status:'error',
                message:'SOMETHING WENT WRONG'
            })
        }
    }

}