import {
    BasicList,
    ListAction,
    ListContext,
    ListItem,
    Neovim,
    workspace,
} from "coc.nvim";

export default class DemoList extends BasicList {
    public readonly name = "demo_list";
    public readonly description = "CocList for coc-rest";
    public readonly defaultAction = "open";
    public actions: ListAction[] = [];

    constructor(nvim: Neovim) {
        super(nvim);

        this.addAction("open", (item: ListItem) => {
            workspace.showMessage(`${item.label}, ${item.data.name}`);
        });
        this.addAction("delete", (item: ListItem) => {
            workspace.showMessage(`delete ${item.label}`);
        });
        this.addAction("call", (item: ListItem) => {
            workspace.showMessage(`call ${item.label}`);
        });
    }

    public async loadItems(context: ListContext): Promise<ListItem[]> {
        return [
            {
                label: "coc-rest list item 1",
                data: { name: "list item 1" },
            },
            {
                label: "coc-rest list item 2",
                data: { name: "list item 2" },
            },
        ];
    }
}
