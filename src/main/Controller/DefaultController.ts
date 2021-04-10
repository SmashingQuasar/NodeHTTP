import { Controller } from "../Model/Controller.js";
import { Request } from "../Model/Request.js";
import { ServerResponse } from "http";
import { Templating } from "../Model/Templating.js";
import { createGzip } from "zlib";

class DefaultController extends Controller
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
        console.log(`Received request:`);
        console.log(request);
        // let message: string = `Hello world!
        // <br />
        // Everything seems to be working.
        // Received variables: `;

        // let variables_names = Object.keys(request.getQuery());

        // await Promise.all(
        //     variables_names.map(
        //         (name: string): void => {
        //             message += `<br />${name}: ${request.getQuery()[name]}`
        //         }
        //     )
        // );

        // console.log(message);

        const TEMPLATING: Templating = new Templating();
        // let content: string|null = await TEMPLATING.render(`views/index.html`, { title: "Hello world from templating!" });
        let content: string|null = await TEMPLATING.render(`views/index.html`);

        response.setHeader("Content-Type", "text/html");
        response.setHeader("Content-Encoding", "gzip");

        const encoder = createGzip();
        encoder.pipe(response);
        encoder.write(content);
        encoder.end();

        // response.write(content);

        // response.end();
    }
}

export { DefaultController };
