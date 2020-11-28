# coc-rest

A powerful rest client with many features

## Features

* Workspaces for organizing requests into logical groups
* Global config per workspace that gets applied to all requests in a workspace
* Syntax highlighting on output
* Variables
* Multiple requests 
* Simple YAML syntax

## Install

`:CocInstall coc-rest`

If you want syntax highlighting then you'll need these plugins 

`Plug 'inkarkat/vim-ingo-library'`
`Plug 'inkarkat/vim-SyntaxRange'`

## Keymaps

Some useful key mappings

* `nnoremap <silent> <leader>rs :CocCommand coc-rest.send<cr>`
* `nnoremap <silent> <leader>rr :CocList rests<cr>`
* `nnoremap <silent> <leader>rw :CocList workspaces<cr>`

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
variables:
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
variables:
---
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

## Variables

Variables work like template literals in javascript.  
```yaml
url: /${path}
method: post
headers:
params:
data:
    name: whiskers
    color: black
variables:
    path: cats
```

Will give you 

```bash
curl -X POST http://localhost:8000/api/cats -H "Content-Type: applicatoin/json" -d '{"name": "wiskers", "color": "black"}'
```

Variables can be specified in the global file and will be applied to all rests just like the config section.

## Sending Multiple Requests Per REST File

To send more than one request per REST file just add another config section to the rest

```
url: /${path}
method: post
headers:
params:
data:
    name: whiskers
    color: black
variables:
    path: cats
---
url: /${path}
method: post
headers:
params:
data:
    name: spot
    color: brown
variables:
    path: dogs
```

Please note that the variables from the first request don't propagate to the next request. In the example above, variables.path, must be supplied for both requests for the url to be interpolated.  If path was the same then it may make sense to move that variable to the global file for this workspace.

## License

MIT

---

> This extension is created by [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
