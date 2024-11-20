# editor-dev

this is a proof of concept for our 1.0 editor

## functional goals:

- [ ] CRUD selections for given codes/subcodes
- [ ] visualize  overlapping selections
- [ ] support text-editing and -formatting while ensuring selection indexes
- [ ] support collaborative coding by leveraging quill's delta format and OT
- [ ] use quill's module system to provide switchable visualization formats (background highlighting; multiple underlines; etc.)

## non-functional goals:

- [ ] find a well-fitting data structure to represent codes and selections that enables fast recompute
- [ ] keep it performant to support collaborative live-coding with many (hundrets+) selections

## installation

you need to have nodejs and npm installed.

```shell
git clone git@github.com:openqda/editor-dev.git
cd editor-dev
npm install
npm run dev
```

then navigate to  http://localhost:5173/ in your browser.

