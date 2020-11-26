# coc-rest

A coc-post or vim-rest-console like plugin but with more features.


## Features

* Workspaces for organizing requests into logical groups
* Global config per workspace that gets applied to all requests in a workspace
* Syntax highlighting on output

### TODOs

* Variables
* Better buffer management


## Install

`:CocInstall coc-rest`

If you want syntax highlighting then you'll need these plugins 

`Plug 'inkarkat/vim-ingo-library'`
`Plug 'inkarkat/vim-SyntaxRange'`



## Keymaps

Some useful key mappings

`nnoremap <silent> <leader>rs :CocCommand coc-rest.send<cr>`
`nnoremap <silent> <leader>rr :CocList rests<cr>`
`nnoremap <silent> <leader>rw :CocList workspaces<cr>`

## Lists

`:CocList workspaces`

`:CocList rests`

## Examples

### Create A Workspace

1. `:CocList workspaces`
2. `Tab`
3. `(n)ew`
4. Enter in new name for workspace 

After step 4 you'll see a `global.yaml` file open with the following 

```yaml
baseURL: 
headers:
```

Here is where you'll put your `baseURL` and any headers that should be applied to any request in this workspace.

An example would look like this
```yaml
baseURL: http://localhost:8000/api
headers:
    Content-Type: application/json
```

### Create A REST

1. `:CocList workspaces`
2. Select the workspace to create the REST in.
3. `Tab`
4. `(n)ew`
5. Enter in new name for REST

After step 5 you'll see a file with the name you typed in above with the following fields

```yaml
url: 
method: 
headers:
params:
data:
```

An example would look like 
```yaml
url: /cats
method: post
headers:
params:
data:
    name: whiskers
    color: black
```

Building off of the global config, the request will looks like

`curl -X POST http://localhost:8000/api/cats -H "Content-Type: applicatoin/json" -d '{"name": "wiskers", "color": "black"}'`

### Create A REST 2

If you set `coc-rest.pin-workspace` in your `CocConfig`, either local or global then you can skip going through the workspace list and go straight to `:CocList rests`.  This will take you to the workspace you have pined.

## License

MIT

---

> This extension is created by [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
