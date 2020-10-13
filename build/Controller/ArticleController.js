"use strict";
const Controller_1 = require("../Model/Controller");
const Templating_1 = require("../Model/Templating");
const zlib = require('zlib');
var Model;
(function (Model) {
    class ArticleController extends Controller_1.Controller {
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
            const TEMPLATING = new Templating_1.Templating();
            let content = await TEMPLATING.render(`index.html`, { title: "Hello world from templating!" });
            response.setHeader("Content-Type", "text/html");
            response.setHeader("Content-Encoding", "gzip");
            const encoder = zlib.createGzip();
            encoder.pipe(response);
            encoder.write(content);
            encoder.end();
        }
    }
    Model.ArticleController = ArticleController;
})(Model || (Model = {}));
module.exports = Model;
