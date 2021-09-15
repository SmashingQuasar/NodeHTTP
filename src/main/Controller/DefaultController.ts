import { Controller } from "../Model/Controller.js";
import { Request } from "../Model/Request.js";
import { ServerResponse } from "http";
import { createGzip } from "zlib";
import { JobHandler } from "./../Model/JobHandler.js";
import { System } from "../Model/System.js";
import { Configuration } from "../Model/Configuration.js";

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
        
        try
        {
            const JOB_HANDLER: JobHandler = new JobHandler();
            await JOB_HANDLER.initialize();
    
            const JOBS: Array<JobConfiguration> = await Configuration.Load("jobs");
    
            JOBS.forEach(
                (configuration: JobConfiguration): void => {
                    JOB_HANDLER.register(configuration);
                }
            );
    
            JOB_HANDLER.startAll();
        }
        catch(error)
        {
            System.Logger.logError(error);
        }
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

        // const TEMPLATING: Templating = new Templating();
        // let content: string|null = await TEMPLATING.render(`views/index.html`, { title: "Hello world from templating!" });
        // let content: string|null = await TEMPLATING.render(`views/index.html`);

        response.setHeader("Content-Type", "text/html");
        response.setHeader("Content-Encoding", "gzip");

        const encoder = createGzip();
        encoder.pipe(response);
        encoder.write("Job done.");
        encoder.end();

        // response.write(content);

        // response.end();
    }
}

export { DefaultController };
