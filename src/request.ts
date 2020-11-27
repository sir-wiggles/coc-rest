import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import columnify from "columnify";
import yaml from "js-yaml";
import { merge } from "lodash";
import { workspace, Neovim, Buffer } from "coc.nvim";

import { dirname, join } from "path";
import { logger } from "./index";
import Response from "./response";
import { GLOBAL } from "./files";

export default class Request {
    private nvim: Neovim = workspace.nvim;
    private config: AxiosRequestConfig = {};

    /*
     * init prepares the request to be sent
     */
    public static async init(): Promise<Request> {
        const r = new Request();
        try {
            await r.prepareRequest();
        } catch (e) {
            logger.error("Request.init", e);
            throw e;
        }
        return r;
    }

    /*
     * send makes the actual network call
     */
    public async send() {
        try {
            const response = await axios(this.config);
            (await Response.init(response)).show();
        } catch (e) {
            logger.error("Request.send", e);
            throw e;
        }
    }

    /*
     * prepareRequest merges local and global request parameters into one
     * AxiosRequestConfig. Local parameters take priority over global ones.
     * The final config will have keys removed that have null values. So if
     * you want to override a global or remove a global from the request, set
     * the key name but leave the value blank.
     */
    private async prepareRequest() {
        const [lc, lv] = await this.readLocal();
        logger.info("prepareRequest", { local: [lc, lv] });
        const [gc, gv] = await this.readGlobal();
        logger.info("prepareRequest", { global: [gc, gv] });
        const c = this.prune(merge(gc, lc));
        const v = this.prune(merge(gv, lv));
        this.config = this.interpolate(c, v);
        logger.info("prepareRequest", { combined: this.config });
    }

    /*
     * readLocal reads the request buffer to be formed into a request
     */
    private async readLocal(): Promise<AxiosRequestConfig[]> {
        const lines = await (await this.nvim.buffer).lines;
        return yaml.safeLoadAll(lines.join("\n"));
    }

    /*
     * readGlobal reads the global workspace values to be used when creating a
     * request.  These request defaults are common to all the requests
     * in the workspace.
     */
    private async readGlobal(): Promise<AxiosRequestConfig[]> {
        const file = join(dirname(workspace.uri), GLOBAL);
        const lines = await workspace.readFile(file);
        return yaml.safeLoadAll(lines);
    }

    /*
     * prune removes keys from a dictionary where their values are null
     */
    private prune(obj: any): AxiosRequestConfig {
        return JSON.parse(JSON.stringify(obj), (_, value) => {
            if (value == null || value == "" || value == [] || value == {})
                return undefined;
            return value;
        });
    }

    private interpolate(config, params) {
        const template = yaml.safeDump(config);
        const names = Object.keys(params);
        const vals = Object.values(params);
        return yaml.safeLoad(
            new Function(...names, `return \`${template}\`;`)(...vals)
        );
    }
}
