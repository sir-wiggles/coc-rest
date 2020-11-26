import {
    commands,
    CompleteResult,
    ExtensionContext,
    listManager,
    workspace,
    WorkspaceConfiguration,
} from "coc.nvim";
import { Logger } from "log4js";

import DirectoriesList from "./directories";
import Request from "./request";

export const state = new Map<string, any>();
export let config: WorkspaceConfiguration;
export let logger: Logger;

import axios from "axios";

export async function activate(context: ExtensionContext): Promise<void> {
    logger = context.logger;
    config = workspace.getConfiguration("coc-rest");

    if (!config.get<boolean>("enabled")) {
        return logger.info(`disabled`);
    }
    logger.info(`enabled`);
    const root = config.get<string>("directory", "");

    context.subscriptions.push(
        commands.registerCommand("coc-rest.send", async () => {
            workspace.showMessage("sending...");
            (await Request.init()).send();
            workspace.showMessage("");
        }),

        listManager.registerList(new DirectoriesList(workspace.nvim, root))

        // sources.createSource({
        // name: "coc-rest completion source", // unique id
        // shortcut: "[CS]", // [CS] is custom source
        // priority: 1,
        // triggerPatterns: [], // RegExp pattern
        // doComplete: async () => {
        // const items = await getCompletionItems();
        // return items;
        // },
        // }),

        // workspace.registerKeymap(
        // ["n"],
        // "coc-rest-keymap",
        // async () => {
        // workspace.showMessage(`registerKeymap`);
        // },
        // { sync: false }
        // ),

        // workspace.registerAutocmd({
        // event: "InsertLeave",
        // request: true,
        // callback: () => {
        // workspace.showMessage(`registerAutocmd on InsertLeave`);
        // },
        // })
    );
}

async function getCompletionItems(): Promise<CompleteResult> {
    return {
        items: [
            {
                word: "TestCompletionItem 1",
            },
            {
                word: "TestCompletionItem 2",
            },
        ],
    };
}
