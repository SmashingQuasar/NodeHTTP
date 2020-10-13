const PARENT = require("../build/Model/View.js");
class View extends PARENT.View
{
    constructor()
    {
        super();
        this.layout = 'null';
        this.content = `<h1>${this.parameters.title}</h1>
`;
    }
}
module.exports = View;