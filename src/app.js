// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const axios = require('axios')

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {

    const getDataById = (text, id) => {
        let res = '';
        if(text.includes(id)) {
            res = text.split(id)[1];
            res = res.split('>')[1];
            res = res.split('<')[0];
        }
        return res;
    }

    const geTrackerbaseUrl = 'https://www.ge-tracker.com';

    const getItemPrice = async (item) => {
        const url = `${geTrackerbaseUrl}/item/${item}`;
        const resp = await axios(url);
        const body = resp.data;

        return parseInt(getDataById(body, 'item_stat_overall').replace(',', ''));
    }

    const itemsToLookup = [
        {
            item: 'torstol',
            seed_name: 'torstol-seed',
            grimy_name: 'grimy-torstol',
            seed_price: 0,
            herb_price: 0,
            profit: 0
        },
        {
            item: 'ranarr',
            seed_name: 'ranarr-seed',
            grimy_name: 'grimy-ranarr-weed',
            seed_price: 0,
            herb_price: 0,
            profit: 0
        },
        {
            item: 'snapdragon',
            seed_name: 'snapdragon-seed',
            grimy_name: 'grimy-snapdragon',
            seed_price: 0,
            herb_price: 0,
            profit: 0
        },
        {
            item: 'toadflax',
            seed_name: 'toadflax-seed',
            grimy_name: 'grimy-toadflax',
            seed_price: 0,
            herb_price: 0,
            profit: 0
        }
    ];

    console.log(event);


    const getBody = async() => {
        const promises = [];

        itemsToLookup.forEach(async(item) => {
            promises.push(getItemPrice(item.seed_name).then(res => {
                item.seed_price = res;
                return getItemPrice(item.grimy_name).then(res => {
                    item.herb_price = res;
                    item.profit = item.herb_price*8.5 - item.seed_price;
                    console.log(`item: ${item.item} profit: ${item.profit}`)
                });
            }));
        });
    
    
        return Promise.all(promises).then(x => {
                return `<html>
                    <head>
                        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                    </head>
                    <body style="background-color: #4fb86b">
                        <div class="container">
                            <h1>Farming Herbs Profit per Seed</h1>
                            <table class="table">
                                <tr>
                                    <th>Item</th>
                                    <th>Seed Price</th>
                                    <th>Herb Price</th>
                                    <th>Profit</th>
                                </tr>
                                ${getTable()}
                            </table>
                        </div>
                    </body>
                </html>`
        });
    }
    
    const numberWithCommas = (x) => {
        return "$" + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const getTable = () => {
        let data = "";
        itemsToLookup.forEach(item => {
            data += `<tr>
                <td>${item.item}</td>
                <td>${numberWithCommas(item.seed_price)}</td>
                <td>${numberWithCommas(item.herb_price)}</td>
                <td>${numberWithCommas(item.profit)}</td>
            </tr>`
        });

        return data;
    }
    try {
        // const ret = await axios(url);
        //context.succeed(await getBody());
        response = {
            'statusCode': 200,
            'headers': { "Content-Type": "text/html" },
            'body': await getBody()
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};
