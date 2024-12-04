# github-time-tracker

With this Vue app you can track the time you spend on GitHub issues.

The site is completely static, all data is stored in GitHub.

A gist called 'GHTT-state' is used for some state data and tracking info is stored in GitHub issues.
You identify yourself using a GitHub token.
The token is stored encrypted in your browser cache and will not leave your machine (except for GitHub API calls of
course)

# development

## Project Setup

```shell
npm install
```

### Compile and Hot-Reload for Development

```shell
npm run dev
```

### Type-Check, Compile and Minify for Production

```shell
npm run build
```
