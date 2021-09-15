import { promises as FileSystem, Stats } from "fs";
import { View as AbstractView } from "./View.js";
import { basename } from "path";
import { System } from "./System.js";

class Templating
{
    protected publicDirectory: string = "";

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
        this.publicDirectory = `${System.RootDirectory}/www`;
        
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

            template = `import { View as AbstractView } from "${System.RootDirectory}/build/main/Model/View.js";
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

            // const SAVE_DIRECTORY_MATCH: RegExpMatchArray|null = path.match(/(.*)\/[^/]+\.html$/)
            // let save_directory: string = "";
            // console.log(SAVE_DIRECTORY_MATCH);

            // if (SAVE_DIRECTORY_MATCH !== null)
            // {
            //     save_directory = `${__DIRNAME__}/../../cache/${SAVE_DIRECTORY_MATCH[1]}`;
            // }
            // else
            // {
            //     save_directory = `${__DIRNAME__}/../../cache`;
            // }

            const FILENAME: string = basename(path);

            const SAVE_PATH: string = path.replace(new RegExp(`/?${FILENAME}`), "");

            const DESTINATION_DIRECTORY: string = `${System.RootDirectory}/build/cache/${SAVE_PATH}`;

            await FileSystem.mkdir(DESTINATION_DIRECTORY, { recursive: true });

            const FULL_FILE_PATH: string = `${DESTINATION_DIRECTORY}/${FILENAME}.mjs`;

            await FileSystem.writeFile(FULL_FILE_PATH, template);

            const { View } = await import(FULL_FILE_PATH);
            const VIEW: AbstractView = new View(parameters);
            await VIEW.render();
            await VIEW.build();
            const CONTENT: string = VIEW.getContent();

            return CONTENT;
        }
        catch (e)
        {
            console.log("------------------------------------------");
            console.log(e);
            console.log(`Attempted to render path "${path}". File not found.`);
            console.log("------------------------------------------");
            //TODO Log file not found error here
            return null;
        }
    }
}

export { Templating };
