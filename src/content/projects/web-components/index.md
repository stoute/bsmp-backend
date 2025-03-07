---
title: "bsmp-webcomponents"
summary: "Reusable web components from bsmp"
date: "June 1 2020"
draft: false
tags:
- Javascript
- Typescript
demoUrl: https://bsmp-webcomponents.web.app
repoUrl: https://github.com/stoute/webcomponents
---

#### Web components library
`@bsmp/webcomponents`
- Reusable Web Components
- The web components are standard HTML elements, so they work in any major framework or with no framework at all.
- In many cases, the components can be used as a drop in replacement for traditional frontend frameworks to build widgets, microapps, apps, etc.

[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)


### Using the webcomponents library

#### Script tag

- Put the following script tag in the head of your index.html:  `<script src='https://unpkg.com/@bsmp/webcomponents/dist/bsm.js'></script>`
- You can then use the webcomponents anywhere in your template, JSX, html etc.

#### In a stencil-starter app
- Run `npm install @bsmp/webcomponents --save`
- Add an import to the npm packages `import '@bsmp/webcomponents';`
- Then you can use the webcomponents anywhere in your template, JSX, html etc

### Dev: getting started
Clone the repo, then run:

```bash
npm install
npm start
```

To watch for file changes during develop, run:

```bash
npm run dev
```

To build the components and classes for production, run:

```bash
npm run build
```

To run the unit tests for the components and classes, run:

```bash
npm test
```

Need help? Check out the Stencil docs [here](https://stenciljs.com/docs/my-first-component).
