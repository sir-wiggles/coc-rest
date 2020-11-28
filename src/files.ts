import fs from "fs";
import { join } from "path";

import {
    workspace,
    BasicList,
    ListContext,
    ListItem,
    ListAction,
    Neovim,
} from "coc.nvim";

import { logger } from "./index";

export const GLOBAL = "global.yaml";

const globalTemplate = `
# global config
baseURL:
headers:
variables: 
`;

const restTemplate = `
# rest config
url:
method:
headers:
params:
data:
variables: 
`;

export default class FilesList extends BasicList {
    public readonly name = "rests";
    public readonly description = "a list of all rests within a workspace";
    public readonly defaultAction = "open";
    public actions: ListAction[] = [];
    public directory: string;

    constructor(nvim: Neovim, directory: string) {
        super(nvim);
        this.directory = directory;

        this.addAction("open", (item: ListItem) => {
            workspace.openResource(join(item.data.path));
        });

        this.addAction("new", (item: ListItem) => {
            workspace.showMessage(`make new ${this.directory}`);
            this.make(item.data.directory, restTemplate.split("\n"), false);
        });

        this.addAction("delete", (item: ListItem) => {
            workspace.showMessage(`delete ${item.label}`);
        });

        this.addAction("global", (item: ListItem) => {
            workspace.showMessage(`Open global file for ${item.data.directory}`);
            workspace.openResource(join(item.data.path, GLOBAL));
        });
    }

    public async loadItems(context: ListContext): Promise<ListItem[]> {
        const directories: ListItem[] = [];
        const files: ListItem[] = [];

        fs.readdirSync(this.directory).forEach((fn: string) => {
            const path = join(this.directory, fn);
            const data = { label: fn, data: { path: path, directory: this.directory } };

            if (fs.lstatSync(path).isDirectory()) {
                directories.push(data);
            } else {
                files.push(data);
            }
        });

        if (files.length === 0) {
            const path = join(this.directory, GLOBAL);
            await this.make(path, globalTemplate.split("\n"), true);
            return [{ label: GLOBAL, data: { path: path, directory: this.directory } }];
        }
        return files;
    }

    private async make(path: string, lines: string[], isGlobal: boolean) {
        if (!isGlobal) {
            const fn = await workspace.nvim.commandOutput("echo input('New rest: ')");
            path = join(path, `${fn}.yaml`);
        }
        await workspace.createFile(path);
        await workspace.openResource(path);
        await (await workspace.nvim.buffer).insert(lines, 0);
        await workspace.nvim.command("w");
    }
}
