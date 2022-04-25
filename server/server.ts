import * as express from "express";
import * as bodyParser from 'body-parser';
import { initLogger } from "./conf/Logger";
import BuildResourceRouter from './routers/ResourcesRouter';
import LoginRouter from './routers/LoginRouter';

import { withAuth } from './middlewares/auth'
import { connectToDatabase } from './mongoose/DatabaseEndpoint';

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json")

require('dotenv').config();

const init = async (): Promise<void> => {
    const app: express.Application = express();

    await initLogger();
    await connectToDatabase();

    app.use(bodyParser.json());

    app.use(LoginRouter());
    // app.use(withAuth);

    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument)
    )

    app.post('/welcome', withAuth, (req, res) => {
        res.status(200).send("Welcome 🙌 ");
    });

    app.use(BuildResourceRouter());

    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`)
    })
}


init();