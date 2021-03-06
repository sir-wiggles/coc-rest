import qs from "querystring";
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios";
import curlirize from "axios-curlirize";
import columnify from "columnify";
import yaml from "js-yaml";
import { merge, transform } from "lodash";
import { workspace, Neovim, Buffer } from "coc.nvim";

import { dirname, join } from "path";
import { logger } from "./index";
import Response from "./response";
import { GLOBAL } from "./files";

curlirize(axios);

export default class Request {
    private nvim: Neovim = workspace.nvim;
    private configs: AxiosRequestConfig[] = [];

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
        const r = await Response.init();
        for (let i = 0; i < this.configs.length; i++) {
            try {
                const response = await axios(this.configs[i]);
                await r.show(response, i + 1);
            } catch (e: any) {
                logger.error("Request.send", e);
                await r.error(e, i + 1);
            }
        }
        logger.warn("switching buffer");
        await this.nvim.command(`${r.pre}wincmd w`);
    }

    /*
     * prepareRequest merges local and global request parameters into one
     * AxiosRequestConfig. Local parameters take priority over global ones.
     * The final config will have keys removed that have null values. So if
     * you want to override a global or remove a global from the request, set
     * the key name but leave the value blank.
     */
    private async prepareRequest() {
        const locals = await this.readLocal();
        logger.info("prepareRequest", { local: JSON.stringify(locals, null, 4) });
        const global = await this.readGlobal();
        logger.info("prepareRequest", { global: JSON.stringify(global, null, 4) });
        locals.forEach((local) => {
            const merged = merge(global, local);
            logger.info("prepareRequest-merged", merged);
            const c: any = this.prune(merged);
            logger.info("prepareRequest-pruned", c);

            const headers = transform(c.headers, (result, val, key) => {
                result[key.toLowerCase()] = val;
            });
            if (
                headers &&
                headers["content-type"] === "application/x-www-form-urlencoded"
            ) {
                c.data = qs.stringify(c.data);
            }
            if (c.variables) {
                this.configs.push(this.interpolate(c, c.variables));
            } else {
                this.configs.push(c);
            }
            c.paramsSerializer = (params) => {
                return qs.stringify(params);
            };
        });
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
    private async readGlobal(): Promise<AxiosRequestConfig> {
        const file = join(dirname(workspace.uri), GLOBAL);
        const lines = await workspace.readFile(file);
        return yaml.safeLoad(lines);
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
