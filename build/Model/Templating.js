"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Templating = void 0;
const fs_1 = require("fs");
class Templating {
    constructor() {
        this.publicDirectory = `${__dirname}/../../www`;
    }
    async render(path, parameters) {
        try {
            const FULL_PATH = `${this.publicDirectory}/${path}`;
            const FILE_STATS = await fs_1.promises.stat(FULL_PATH);
            if (!FILE_STATS.isFile()) {
                throw new Error(`Attempted to render path "${FULL_PATH}". Directory found.`);
            }
            const FILE = await fs_1.promises.readFile(FULL_PATH);
            let template = FILE.toString();
            if (parameters !== undefined) {
                const PARAMETERS_NAMES = Object.keys(parameters);
                for (let parameter of PARAMETERS_NAMES) {
                    const REGEXP = new RegExp(`{{${parameter}}}`);
                    template = template.replace(REGEXP, `\${parameter}`);
                }
            }
            const LAYOUT = template.match(/{{layout: *([^}]+)}}/);
            let layout = "";
            if (LAYOUT !== null) {
                layout = LAYOUT[1];
            }
            template = template.replace(/{{layout: *([^}]+)}}/, "");
            template = template.replace(/{{include: *([^}]+)}}/g, "`;\r\nawait this.include('$1');\r\nthis.content += `");
            template = template.replace(/{{for: *([^}]+)}}/g, "`;\r\nfor ($1)\r\n{\r\nthis.content += `");
            template = template.replace(/{{endfor}}/g, "`;\r\n}\r\nthis.content += `");
            template = template.replace(/{{if: *([^}]+)}}/g, "`;\r\nif ($1)\r\n{\r\nthis.content += `");
            template = template.replace(/{{else if: *([^}]+)}}/g, "`;\r\n}\r\nelse if ($1) {\r\nthis.content += `");
            template = template.replace(/{{else}}/g, "`;\r\n}\r\nelse\r\n{\r\nthis.content += `");
            template = template.replace(/{{endif}}/g, "`;\r\n}\r\nthis.content += `");
            template = template.replace(/{{([^}]+)}}/g, "${$1}");
            let root_directory = `${__dirname}/../../`;
            template = `const PARENT = require("${root_directory}build/Model/View.js");
class View extends PARENT.View
{
    constructor(parameters)
    {
        super(parameters);
        this.layout = '${layout}';
    }
    async render()
    {
        this.content = \`${template}\`;
        return this.content;
    }
}
module.exports = View;`;
            const SAVE_DIRECTORY_MATCH = path.match(/(.*)\/[^/]+\.html$/);
            let save_directory = "";
            if (SAVE_DIRECTORY_MATCH !== null) {
                save_directory = `${__dirname}/../../cache/${SAVE_DIRECTORY_MATCH[1]}`;
            }
            const SAVE_PATH = path.replace(/\.html$/g, "");
            const DESTINATION_PATH = `${__dirname}/../../cache/${SAVE_PATH}.js`;
            if (save_directory !== "") {
                await fs_1.promises.mkdir(save_directory, { recursive: true });
            }
            await fs_1.promises.writeFile(DESTINATION_PATH, template);
            const CLASS = require(DESTINATION_PATH);
            const VIEW = new CLASS(parameters);
            await VIEW.render();
            await VIEW.build();
            const CONTENT = VIEW.getContent();
            return CONTENT;
        }
        catch (e) {
            console.log(e);
            console.log(`Attempted to render path "${path}". File not found.`);
            return null;
        }
    }
}
exports.Templating = Templating;
