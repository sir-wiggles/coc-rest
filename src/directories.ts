import os from "os";
import fs from "fs";
import { join } from "path";

import {
    workspace,
    BasicList,
    listManager,
    ListAction,
    ListContext,
    ListItem,
    Neovim,
} from "coc.nvim";

import FilesList from "./files";
import { state, logger, mkdir } from "./index";

export default class DirectoriesList extends BasicList {
    public readonly name = "workspaces";
    public readonly description = "a listing of all coc-rest workspaces";
    public readonly defaultAction = "open";
    public actions: ListAction[] = [];
    public root: string;

    constructor(nvim: Neovim, root: string) {
        super(nvim);

        this.root = mkdir(root);

        // fu js!
        this.open = this.open.bind(this);
        this.make = this.make.bind(this);

        this.addAction("open", this.open);
        this.addAction("new", this.make);

        logger.info("actions", this.actions);
    }

    public async open(item: ListItem) {
        logger.info({ item: JSON.stringify(item) });
        listManager.registerList(new FilesList(workspace.nvim, item.data.path));
        await workspace.nvim.command("CocList rests");
    }

    public async make(item: ListItem) {
        const fn = await workspace.nvim.commandOutput("echo input('New workspace: ')");
        logger.info("directory.new", JSON.stringify(item));
        const path = join(item.data.directory, fn);
        if (!fs.existsSync(<fs.PathLike>path)) {
            fs.mkdirSync(<fs.PathLike>path);
        } else {
            workspace.showMessage("existing workspace");
        }
        item = { label: fn, data: { directory: item.data.directory, path } };
        await this.open(item);
    }

    public async loadItems(context: ListContext): Promise<ListItem[]> {
        const directories: ListItem[] = [];
        const files: ListItem[] = [];

        fs.readdirSync(this.root).forEach((fn: string) => {
            const path = join(this.root, fn);
            const data = {
                label: fn,
                data: {
                    directory: this.root,
                    path: path,
                },
            };
            logger.info({ data });

            if (fs.lstatSync(path).isDirectory()) {
                directories.push(data);
            } else {
                files.push(data);
            }
        });

        if (directories.length === 0) {
            return [{ label: "", data: { directory: this.root, path: this.root } }];
        }
        return directories;
    }
}
