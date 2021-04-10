import { promises as FileSystem } from "fs";
import { basename } from "path";
import { System } from "./System.js";
class Templating {
    constructor() {
        this.publicDirectory = "";
    }
    async render(path, parameters) {
        const __DIRNAME__ = await System.GetRootDirectory();
        this.publicDirectory = `${__DIRNAME__}/www`;
        try {
            const FULL_PATH = `${this.publicDirectory}/${path}`;
            const FILE_STATS = await FileSystem.stat(FULL_PATH);
            if (!FILE_STATS.isFile()) {
                throw new Error(`Attempted to render path "${FULL_PATH}". Directory found.`);
            }
            const FILE = await FileSystem.readFile(FULL_PATH);
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
            template = `import { View as AbstractView } from "${__DIRNAME__}/build/main/Model/View.js";
class View extends AbstractView
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
export { View };`;
            const FILENAME = basename(path);
            const SAVE_PATH = path.replace(new RegExp(`/?${FILENAME}`), "");
            const DESTINATION_DIRECTORY = `${__DIRNAME__}/build/cache/${SAVE_PATH}`;
            await FileSystem.mkdir(DESTINATION_DIRECTORY, { recursive: true });
            const FULL_FILE_PATH = `${DESTINATION_DIRECTORY}/${FILENAME}.mjs`;
            await FileSystem.writeFile(FULL_FILE_PATH, template);
            const { View } = await import(FULL_FILE_PATH);
            const VIEW = new View(parameters);
            await VIEW.render();
            await VIEW.build();
            const CONTENT = VIEW.getContent();
            return CONTENT;
        }
        catch (e) {
            console.log("------------------------------------------");
            console.log(e);
            console.log(`Attempted to render path "${path}". File not found.`);
            console.log("------------------------------------------");
            return null;
        }
    }
}
export { Templating };
