# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:import-analysis] Failed to resolve import \"../styles/Common.css\" from \"src/pages/Users.jsx\". Does the file exist?"
  - generic [ref=e5]: /app/src/pages/Users.jsx:12:7
  - generic [ref=e6]: "12 | import userService from \"../services/userService\"; 13 | import UserDialog from \"../components/users/UserDialog\"; 14 | import \"../styles/Common.css\"; | ^ 15 | const emptyForm = { 16 | id: null,"
  - generic [ref=e7]: at TransformPluginContext._formatLog (file:///app/node_modules/vite/dist/node/chunks/config.js:28999:43) at TransformPluginContext.error (file:///app/node_modules/vite/dist/node/chunks/config.js:28996:14) at normalizeUrl (file:///app/node_modules/vite/dist/node/chunks/config.js:27119:18) at process.processTicksAndRejections (node:internal/process/task_queues:105:5) at async file:///app/node_modules/vite/dist/node/chunks/config.js:27177:32 at async Promise.all (index 12) at async TransformPluginContext.transform (file:///app/node_modules/vite/dist/node/chunks/config.js:27145:4) at async EnvironmentPluginContainer.transform (file:///app/node_modules/vite/dist/node/chunks/config.js:28797:14) at async loadAndTransform (file:///app/node_modules/vite/dist/node/chunks/config.js:22670:26) at async viteTransformMiddleware (file:///app/node_modules/vite/dist/node/chunks/config.js:24542:20)
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.js
    - text: .
```