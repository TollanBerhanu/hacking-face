import puppeteer from 'puppeteer';
import express from 'express'
import dotenv from 'dotenv';
dotenv.config();
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.send('ok...please send a post request')
})
app.post('/', (req, res) => {
    const query = req.body.query;
    const link = req.body.link;
    try {

        (async () => {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            console.log("Loading page...");
            await page.goto(link, { timeout: 60000 * 2, waitUntil: 'domcontentloaded' });

            const elementHandle = await page.waitForSelector('#iFrameResizer0');
            const frame = await elementHandle.contentFrame();
            await frame.waitForSelector('#component-6 textarea');
            const inputArea = await frame.$('#component-6 textarea');
            await inputArea.type(query);
            await frame.waitForSelector('#component-7')
            const button = await frame.$('#component-7');
            button.click()
            console.log("Waiting for generated response...(might timeout)");

            await frame.waitForSelector('#component-4 .wrap.default.minimal.translucent.generating');
            console.log("Got it!");
            await frame.waitForSelector('#component-4 .wrap.default.minimal.translucent.hide');
            await frame.waitForSelector('.message.bot.latest');
            const textData = await frame.$('.message.bot.latest');
            const data = await textData?.evaluate(el => el.textContent);
            console.log({data});
            res.send(data)
            await browser.close();
        })();
    } catch (e) {
        res.statusCode(500);
        res.send(JSON.stringify(e))
    }
})
const port = process.env.port || 3434
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

