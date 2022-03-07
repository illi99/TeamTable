import * as express from "express";
import * as bodyParser from 'body-parser';
import { initLogger } from "./conf/Logger";
import BuildResourceRouter from './routers/ResourcesRouter';
import {connectToCluster} from "./services/mongo.service";
import LoginRouter from './routers/LoginRouter';

import { withAuth } from './middlewares/auth'
import { connectToDatabase } from './mongoose/DatabaseEndpoint';

require('dotenv').config();

const init = async (): Promise<void> => {
    const app: express.Application = express();

    await initLogger();
    await connectToDatabase();

    app.use(bodyParser.json());

    app.use(BuildResourceRouter());
    app.use(LoginRouter());
    app.use(withAuth);

    const db = await connectToCluster().then(client => {
        // Just an example - using mongo
        // console.log(client.collection('users').insertOne({"name":"chenzi"}));
    });

    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`)
    })

    app.post('/welcome', (req, res) => {
        res.status(200).send("Welcome 🙌 ");
      });
}


init();