import { Controller } from "../Model/Controller.js";
import { Templating } from "../Model/Templating.js";
import { createGzip } from "zlib";
class DefaultController extends Controller {
    constructor() {
        super();
    }
    async defaultAction(request, response) {
        console.log(`Received request:`);
        console.log(request);
        const TEMPLATING = new Templating();
        let content = await TEMPLATING.render(`views/index.html`);
        response.setHeader("Content-Type", "text/html");
        response.setHeader("Content-Encoding", "gzip");
        const encoder = createGzip();
        encoder.pipe(response);
        encoder.write(content);
        encoder.end();
    }
}
export { DefaultController };
