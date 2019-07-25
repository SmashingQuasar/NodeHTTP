"use strict";
const Controller_1 = require("../Model/Controller");
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
            response.setHeader("Content-Type", "text/html");
            response.write(message);
            response.end();
        }
    }
    Model.ArticleController = ArticleController;
})(Model || (Model = {}));
module.exports = Model;
