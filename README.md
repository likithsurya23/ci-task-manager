# CI Task Manager

A beginner-friendly Express REST API demonstrating task CRUD operations, application response caching with `node-cache`, automated tests, ESLint, and GitHub Actions CI.

## Requirements
- Node.js 22+
- npm and Git
- GitHub account to run the hosted CI workflow

## Install and run (Windows PowerShell)
```powershell
npm install
npm start
```
API base URL: `http://localhost:3000`

Run tests and lint:
```powershell
npm test
npm run lint
```

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks?status=pending` | Filter tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/cache/stats` | Cache hits, misses and keys |
| DELETE | `/api/cache` | Clear response cache |

Create-task JSON example:
```json
{
  "title": "Learn GitHub Actions",
  "description": "Set up a CI pipeline",
  "status": "pending"
}
```
Allowed statuses: `pending`, `in_progress`, `completed`.

## Test application caching
1. Request `GET /api/tasks` once: response has `"source": "fresh"`.
2. Request it again: response has `"source": "cache"`.
3. Create, update, or delete a task: relevant cached task responses are invalidated.
4. Call `GET /api/cache/stats` to inspect hits and misses.
5. Call `DELETE /api/cache` to clear the cache.

The cache TTL defaults to 30 seconds and can be configured with `CACHE_TTL_SECONDS`. Task data is stored in memory and resets when the server restarts.

## GitHub Actions CI
The workflow in `.github/workflows/ci.yml` runs on pushes and pull requests to `main` or `master`, plus manual dispatch. It checks out the code, sets up Node.js, restores npm's download cache, runs `npm ci`, runs ESLint, executes tests, and writes a workflow summary.

To publish:
1. Create a GitHub repository.
2. In this folder, run `git init`, `git add .`, and `git commit -m "Add CI task manager"`.
3. Add your GitHub repository as `origin`, then push to `main`.
4. Open the repository's **Actions** tab to inspect each step and its logs.

## Two different caches
- **Application cache:** `node-cache` stores API response data in the running Node process.
- **CI dependency cache:** `actions/setup-node` caches npm's downloaded packages between workflow runs. It does not cache API responses or necessarily cache `node_modules`.

For reproducible installs, commit `package-lock.json` and use `npm ci` in CI. This ZIP includes the package manifest; generate the lockfile locally with `npm install` before the first push. This keeps the lockfile consistent with the npm version and resolved dependencies.

## Limitations
This demo uses in-memory tasks and an in-process cache. It is intended for learning, not production. For multiple server instances, consider a database and shared cache such as Redis.
