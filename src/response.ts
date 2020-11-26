import { AxiosResponse } from "axios";
import yaml from "js-yaml";
import { workspace, Neovim, Buffer } from "coc.nvim";

export default class Response {
    private nvim: Neovim = workspace.nvim;
    private buf: any | Buffer;
    private response: any;

    constructor(response: any) {
        this.response = response;
    }

    /*
     * init prepares the output buffer for display
     */
    public static async init(response: AxiosResponse): Promise<Response> {
        const r = new Response(response);
        await r.prepareBuffers();
        return r;
    }

    /*
     * show will print out all the information from the response
     */
    public async show() {
        await this.buf.insert("== Headers ==", 0);
        await this.setHead((await this.buf.length) - 1);
        await this.buf.append("== Body ==");
        await this.setBody(await this.buf.length);
    }

    /*
     * prepareBuffers sets up the output for the response data while keeping
     * reference to the input and output buffers.
     */
    private async prepareBuffers() {
        await this.nvim.command("vnew | set buftype=nofile");
        this.buf = await this.nvim.buffer;
    }

    /*
     * setHead will output the response headers to the output buffer.
     */
    private async setHead(offset: number) {
        const lines = yaml
            .safeDump(this.response.headers, { sortKeys: true })
            .trim()
            .split("\n");
        await this.buf.insert(lines, offset);
        this.setFormat([offset + 1, offset + lines.length], "yaml");
    }

    /*
     * setBody will output the response body to the output buffer.
     */
    private async setBody(offset: number) {
        const lines = JSON.stringify(this.response.data, null, 4).split("\n");
        await this.buf.insert(lines, offset);
        this.setFormat([offset + 1, offset + lines.length], "json");
    }

    /*
     * setFormat will format a range in a buffer to a syntax. For this to work
     * you'll need these plugins
     *  Plug 'inkarkat/vim-ingo-library'
     *  Plug 'inkarkat/vim-SyntaxRange'
     */
    private async setFormat(range: number[], syntax: string) {
        const format = `${range[0]},${range[1]}:SyntaxInclude ${syntax}`;
        await this.nvim.command(format);
    }
}
