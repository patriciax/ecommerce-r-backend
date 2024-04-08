export class BCVController{

    const bcv = await Banner.findOne();

        return response.status(200).json({
            status: 'success',
            data: banner
        })
    }

}