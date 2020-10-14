import { Controller } from "../Model/Controller.js";
import { Templating } from "../Model/Templating.js";
import { createGzip } from "zlib";
class ArticleController extends Controller {
    constructor() {
        super();
    }
    async defaultAction(request, response) {
        let message = `Hello world!
        <br />
        Everything seems to be working.
        Received variables: `;
        let variables_names = Object.keys(request.getQuery());
        await Promise.all(variables_names.map((name) => {
            message += `<br />${name}: ${request.getQuery()[name]}`;
        }));
        console.log(message);
        const TEMPLATING = new Templating();
        let content = await TEMPLATING.render(`index.html`, { title: "Hello world from templating!" });
        response.setHeader("Content-Type", "text/html");
        response.setHeader("Content-Encoding", "gzip");
        const encoder = createGzip();
        encoder.pipe(response);
        encoder.write(content);
        encoder.end();
    }
}
export { ArticleController };
