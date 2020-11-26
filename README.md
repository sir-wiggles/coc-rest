# coc-rest

TLDR: A coc-post or vim-rest-console like plugin but with more features.

I wanted to create a plugin that was more like postman but in vim.  I've been 
using vim-rest-console for a while now but found myself struggling with the syntax
from time to time and coc-post was easier to use but without the global section
I felt it was too annoying to repeate myself. So I made this very much a 
work-in-progress plugin.

Coc-rest has a concept of workspaces which is a collection of request calls. 
Each workspace has its own global config that will be applied to all rests in 
this workspace.  If you need to override a global variable put it in your rest
file and that will take priority. If you want to remove a global from the request
put the key in your rest and leave the value field blank; coc-rest will filter
out keys where their value fields are null, none, nil what have you.

To create a new workspace run `CocList workspaces`.  You'll get a list of all
existing workspaces. Now press `Tab`, you should see an action menu appear
in the command prompt, then press `n` for new.  It'll prompt you to enter a name
for the new workspace. A side effect of creating a new workspace is also opening 
up a global file for that workspace.

To create a new rest run `CocList rests`. and it'll be like creating a new 
workspace above.

## Install

If you're using plug then.

`Plug 'sir-wiggles/coc-rest'`

Otherwise use whatever plugin manager you use.

I'll try and add this to the coc marketplace.

`:CocInstall coc-rest`

## Keymaps

Some useful key mappings

`nnoremap <silent> <leader>rs :CocCommand coc-rest.send<cr>`
`nnoremap <silent> <leader>rr :CocList rests<cr>`
`nnoremap <silent> <leader>rw :CocList workspaces<cr>`

## Lists

`:CocList workspaces`

`:CocList rests`

## License

MIT

---

> This extension is created by [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
