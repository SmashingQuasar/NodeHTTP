import { View as AbstractView } from "/server-dev/projects/nodehttp/build/main/Model/View.js";
class View extends AbstractView
{
    constructor(parameters)
    {
        super(parameters);
        this.layout = '';
    }
    async render()
    {
        this.content = `<h1>${this.parameters.title}</h1>`;
        return this.content;
    }
}
export { View };