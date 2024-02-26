import * as schedule from "node-schedule";
import { DolarPriceController } from "../controllers/dolarPriceController";

export class DolarPriceJob {

    public updateDolarPrice = async() => {
        const dolarPriceController = new DolarPriceController()
        const rule = new schedule.RecurrenceRule();
        rule.hour = [8, 13, 16];

        schedule.scheduleJob(rule, async function () {
            await dolarPriceController.updateDolarPrice()
        
        });
    }

}