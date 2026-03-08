# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Configuration

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory based on `.env.example`.

| Variable | Description | Default (Local) |
|----------|-------------|-----------------|
| `VITE_API_BASE_URL` | The base URL for the backend API | `http://localhost:3000/api` |

**Important Note on Local Network Access:**
If you set `VITE_API_BASE_URL` to a local IP address (e.g., `192.168.x.x`) while the frontend is served over HTTPS on a public domain, browsers may block the requests and show a message asking for permission to access other devices on your local network. For production environments, it is recommended to use a public URL for the API.
