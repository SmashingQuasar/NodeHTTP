import { Controller } from "../Model/Controller";
import { Request } from "../Model/Request";
import { ServerResponse } from "http";

module Model
{
    export class ArticleController extends Controller
    {
        /**
         * constructor
         */
        public constructor()
        {
            super();
        }
        /**
         * defaultAction
         */
        public async defaultAction(request: Request, response: ServerResponse): Promise<void>
        {
            let message: string = `Hello world!
            <br />
            Everything seems to be working.
            Received variables: `;

            let variables_names = Object.keys(request.getQuery());

            await Promise.all(
                variables_names.map(
                    (name: string): void => {
                        message += `<br />${name}: ${request.getQuery()[name]}`
                    }
                )
            );

            response.setHeader("Content-Type", "text/html");
            response.write(message);

            response.end();
        }
    }
}

export = Model;