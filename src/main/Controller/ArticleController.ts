import { Controller } from "../Model/Controller";
import { Request } from "../Model/Request";
import { ServerResponse } from "http";
import { Templating } from "../Model/Templating";
const zlib = require('zlib');

class ArticleController extends Controller
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

        console.log(message);

        const TEMPLATING: Templating = new Templating();
        let content: string|null = await TEMPLATING.render(`index.html`, { title: "Hello world from templating!" });

        response.setHeader("Content-Type", "text/html");
        response.setHeader("Content-Encoding", "gzip");

        const encoder = zlib.createGzip();
        encoder.pipe(response);
        encoder.write(content);
        encoder.end();

        // response.write(content);

        // response.end();
    }
}

export { ArticleController };
