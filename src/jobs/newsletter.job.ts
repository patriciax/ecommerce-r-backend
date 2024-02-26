import * as schedule from "node-schedule";
import { NewsletterController } from "../controllers/newsletterController";

export class NewsletterJob {

    public async sendNewsletter() {

        const newsletterController = new NewsletterController();
        const rule = new schedule.RecurrenceRule();
        rule.hour = 10;

        schedule.scheduleJob(rule, async function () {

            await newsletterController.sendNewsletters()
        
        });
    }

}