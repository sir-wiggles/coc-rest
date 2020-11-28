import { AxiosResponse } from "axios";
import yaml from "js-yaml";
import { workspace, Neovim, Buffer } from "coc.nvim";

const OUTPUT_FILE_NAME = "__coc-rest-output__";

export default class Response {
    private nvim: Neovim = workspace.nvim;
    private buf: any | Buffer;
    private response: any = {};

    /*
     * init prepares the output buffer for display
     */
    public static async init(): Promise<Response> {
        const r = new Response();
        await r.prepareOutput();
        return r;
    }

    /*
     * show will print out all the information from the response
     */
    public async show(response: AxiosResponse, configNumber: number) {
        this.response = response;
        await this.buf.append(
            `========== Request #${configNumber} ==========`,
            this.buf.length
        );
        await this.buf.append("<= Headers ==", this.buf.length);
        await this.setHead(await this.buf.length);
        await this.buf.append("");
        await this.buf.append("<= Body ==");
        await this.setBody(await this.buf.length);
        await this.buf.append("");
    }

    /*
     * prepareOutput finds the previous output buffer if it exists and clears
     * it for the new output. If no buffer is found the window is split.
     */
    private async prepareOutput() {
        let bid = await this.nvim.commandOutput(`echo bufnr("${OUTPUT_FILE_NAME}")`);
        if (bid === "-1") {
            await this.nvim.command(`vsplit ${OUTPUT_FILE_NAME}`);
            await this.nvim.command(`setlocal bt=nofile bh=hide noswapfile`);
            bid = await this.nvim.commandOutput(`echo bufnr("${OUTPUT_FILE_NAME}")`);
        }
        const wid = await this.nvim.commandOutput(`echo bufwinnr(${bid})`);
        if (wid === "-1") {
            await this.nvim.command(`buffer ${bid}`);
        } else {
            await this.nvim.command(`${wid}wincmd w`);
        }
        this.buf = await this.nvim.buffer;
        await this.nvim.commandOutput("1,$d");
    }

    /*
     * setHead will output the response headers to the output buffer.
     */
    private async setHead(offset: number) {
        const lines = yaml
            .safeDump(this.response.headers, { sortKeys: true })
            .trim()
            .split("\n");
        await this.buf.append(lines, offset);
        await this.setFormat([offset + 1, offset + lines.length], "yaml");
    }

    /*
     * setBody will output the response body to the output buffer.
     */
    private async setBody(offset: number) {
        const lines = JSON.stringify(this.response.data, null, 4).split("\n");
        await this.buf.append(lines, offset);
        await this.setFormat([offset + 1, offset + lines.length], "json");
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
