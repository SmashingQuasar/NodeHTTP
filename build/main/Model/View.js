import { promises as FileSystem } from "fs";
import { Templating } from "./Templating.js";
import { System } from "./System.js";
class View {
    constructor(parameters) {
        this.layout = null;
        this.content = "";
        this.publicDirectory = "";
        this.parameters = parameters;
    }
    async build() {
        const __DIRNAME__ = await System.GetRootDirectory();
        this.publicDirectory = `${__DIRNAME__}/www`;
        if (this.layout !== null && this.layout !== "") {
            const STATS = await FileSystem.stat(`${this.publicDirectory}/${this.layout}`);
            if (STATS.isFile() === false) {
                throw new Error(`Requested layout ${this.layout} is not a file.`);
            }
            let content = await FileSystem.readFile(`${this.publicDirectory}/${this.layout}`, { encoding: "UTF-8" });
            if (typeof content === "string" && content.match(/{{main}}/) !== null) {
                content = content.replace(/{{main}}/, this.content);
                this.content = content;
            }
        }
    }
    async include(path) {
        const TEMPLATING = new Templating();
        this.content += await TEMPLATING.render(path, this.parameters);
    }
    async render() {
        return this.content;
    }
    getContent() {
        return this.content;
    }
}
export { View };
