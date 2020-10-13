const PARENT = require("F:\server-dev\projects\nodehttp\build\Model/../../build/Model/View.js");
class View extends PARENT.View
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
module.exports = View;