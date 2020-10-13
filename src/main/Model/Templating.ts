import { promises as FileSystem, Stats } from "fs";
import { View } from "./View";

class Templating
{
    protected publicDirectory: string = `${__dirname}/../../www`;

    /**
     * constructor
     */
    public constructor()
    {
        
    }

    /**
     * render
     */
    public async render(path: string, parameters?: QueryParameter): Promise<string|null>
    {
        try
        {
            const FULL_PATH: string = `${this.publicDirectory}/${path}`;
            const FILE_STATS: Stats = await FileSystem.stat(FULL_PATH);

            if (!FILE_STATS.isFile())
            {
                throw new Error(`Attempted to render path "${FULL_PATH}". Directory found.`);
                //TODO Log path is a directory error
            }

            const FILE: Buffer = await FileSystem.readFile(FULL_PATH);
            let template: string = FILE.toString();

            if (parameters !== undefined)
            {
                const PARAMETERS_NAMES: Array<string> = Object.keys(parameters);

                for (let parameter of PARAMETERS_NAMES)
                {
                    const REGEXP: RegExp = new RegExp(`{{${parameter}}}`);
                    template = template.replace(REGEXP, `\${parameter}`);
                }
            }

            /* Layout */

            const LAYOUT: RegExpMatchArray|null = template.match(/{{layout: *([^}]+)}}/);

            let layout: string = "";

            if (LAYOUT !== null)
            {
                layout = LAYOUT[1];
            }

            template = template.replace(/{{layout: *([^}]+)}}/, "");

            /* Includes */

            template = template.replace(/{{include: *([^}]+)}}/g, "`;\r\nawait this.include('$1');\r\nthis.content += `");

            /* For loop */

            template = template.replace(/{{for: *([^}]+)}}/g, "`;\r\nfor ($1)\r\n{\r\nthis.content += `");
            template = template.replace(/{{endfor}}/g, "`;\r\n}\r\nthis.content += `");
            
            /* If statement */
            
            template = template.replace(/{{if: *([^}]+)}}/g, "`;\r\nif ($1)\r\n{\r\nthis.content += `");
            template = template.replace(/{{else if: *([^}]+)}}/g, "`;\r\n}\r\nelse if ($1) {\r\nthis.content += `");
            template = template.replace(/{{else}}/g, "`;\r\n}\r\nelse\r\n{\r\nthis.content += `");
            template = template.replace(/{{endif}}/g, "`;\r\n}\r\nthis.content += `");
            template = template.replace(/{{([^}]+)}}/g, "${$1}");

            let root_directory: string = `${__dirname}/../../`;

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

            const SAVE_DIRECTORY_MATCH: RegExpMatchArray|null = path.match(/(.*)\/[^/]+\.html$/)
            let save_directory: string = "";

            if (SAVE_DIRECTORY_MATCH !== null)
            {
                save_directory = `${__dirname}/../../cache/${SAVE_DIRECTORY_MATCH[1]}`;
            }
            const SAVE_PATH: string = path.replace(/\.html$/g, "");

            const DESTINATION_PATH: string = `${__dirname}/../../cache/${SAVE_PATH}.js`;

            if (save_directory !== "")
            {
                await FileSystem.mkdir(save_directory, { recursive: true });
            }

            await FileSystem.writeFile(DESTINATION_PATH, template);

            const CLASS = require(DESTINATION_PATH);
            const VIEW: View = new CLASS(parameters);
            await VIEW.render();
            await VIEW.build();
            const CONTENT: string = VIEW.getContent();

            return CONTENT;
        }
        catch (e)
        {
            console.log(e);
            console.log(`Attempted to render path "${path}". File not found.`);
            //TODO Log file not found error here
            return null;
        }
    }
}

export { Templating };
