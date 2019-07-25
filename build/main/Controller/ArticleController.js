"use strict";
var Model;
(function (Model) {
    class ArticleController {
        defaultAction(request) {
            console.log(request);
        }
    }
    Model.ArticleController = ArticleController;
})(Model || (Model = {}));
module.exports = Model;
