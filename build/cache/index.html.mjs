import { View as AbstractView } from "/server-dev/projects/nodehttp/build/main/Model/View.js";
class View extends AbstractView
{
    constructor(parameters)
    {
        super(parameters);
        this.layout = 'layouts/default.html';
    }
    async render()
    {
        this.content = `
`;
await this.include('partials/title.html');
this.content += `
<ul>
    
    `;
for (let i = 0; i < 10; ++i)
{
this.content += `

        `;
for (let j = 0; j < 5; ++j)
{
this.content += `

            `;
if (i % 2 === 0)
{
this.content += `

                <li>Even number ${i}</li>

            `;
}
else if (i % 3 === 0) {
this.content += `

                <li>Can be divided by 3 : ${i}</li>

            `;
}
else
{
this.content += `

                <li>Other ${i}</li>

            `;
}
this.content += `

        `;
}
this.content += `

    `;
}
this.content += `

</ul>`;
        return this.content;
    }
}
export { View };