import {
    commands,
    ExtensionContext,
    listManager,
    workspace,
    WorkspaceConfiguration,
} from "coc.nvim";
import { Logger } from "log4js";
import { join } from "path";
import os from "os";
import fs from "fs";

import DirectoriesList from "./directories";
import FilesList from "./files";
import Request from "./request";

export const state = new Map<string, any>();
export let config: WorkspaceConfiguration;
export let logger: Logger;

export async function activate(context: ExtensionContext): Promise<void> {
    logger = context.logger;
    config = workspace.getConfiguration("coc-rest");

    if (!config.get<boolean>("enabled")) {
        return logger.info(`disabled`);
    }
    logger.info(`enabled`);
    const root = expandPath(config.get<string>("directory", ""));

    const pin = config.get<string>("pin-workspace", "");
    if (pin) {
        workspace.showMessage(root);
        mkdir(join(root, pin));
        listManager.registerList(new FilesList(workspace.nvim, join(root, pin)));
    }

    context.subscriptions.push(
        commands.registerCommand("coc-rest.send", async () => {
            workspace.showMessage("sending...");
            (await Request.init()).send();
            workspace.showMessage("");
        }),

        listManager.registerList(new DirectoriesList(workspace.nvim, root))
    );
}

export function expandPath(root: string): string {
    if (root && root[0] === "~") {
        root = root.replace("~", os.homedir());
    }
    return root;
}

export function mkdir(path: string): string {
    path = expandPath(path);
    if (!fs.existsSync(<fs.PathLike>path)) {
        fs.mkdirSync(<fs.PathLike>path);
    }
    return path;
}
