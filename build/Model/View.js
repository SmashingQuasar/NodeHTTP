"use strict";
const fs_1 = require("fs");
const Templating_1 = require("./Templating");
const util_1 = require("util");
var Model;
(function (Model) {
    class View {
        constructor(parameters) {
            this.layout = null;
            this.content = "";
            this.publicDirectory = `${__dirname}/../../www`;
            this.parameters = parameters;
        }
        async build() {
            if (this.layout !== null && this.layout !== "") {
                const STATS = await fs_1.promises.stat(`${this.publicDirectory}/${this.layout}`);
                if (STATS.isFile() === false) {
                    throw new Error(`Requested layout ${this.layout} is not a file.`);
                }
                let content = await fs_1.promises.readFile(`${this.publicDirectory}/${this.layout}`, { encoding: "UTF-8" });
                if (util_1.isString(content) && content.match(/{{main}}/) !== null) {
                    content = content.replace(/{{main}}/, this.content);
                    this.content = content;
                }
            }
        }
        async include(path) {
            const TEMPLATING = new Templating_1.Templating();
            this.content += await TEMPLATING.render(path, this.parameters);
        }
        async render() {
            return this.content;
        }
        getContent() {
            return this.content;
        }
    }
    Model.View = View;
})(Model || (Model = {}));
module.exports = Model;
