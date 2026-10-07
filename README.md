# RiceApps web app workshop

Fork this repository, clone your fork, and open its folder in your editor. You’ll need Node.js and Python installed (tested with Node 25.3.0 and Python 3.13).

[Workshop slideshow](https://docs.google.com/presentation/d/1N1Fj9UxtaxNMlwWbPzDnJNIxGYJKfJhGYPVaGS15m6E/edit?usp=sharing)

## Your Task

Build **Add Member**: someone should be able to enter a member’s name, class year, and role, add them to the roster, and still see them after refreshing the page.

Find the numbered `TODO` comments and replace them with your code. The completed Projects feature is there as a reference. Use fictional names while trying it out.

## 1. Run the frontend

Open a terminal in the repository’s root folder. Install dependencies, then start the frontend:

```sh
npm ci
npm run dev
```

Leave this terminal running. Open [Members](http://localhost:5173/ui/members.html) or [Projects](http://localhost:5173/ui/projects.html). Start the backend below so the pages can load and save data.

## 2. Run the backend

Open a **second terminal** in the same root folder. Create a Python environment and install dependencies:

```sh
python3.13 -m venv server/.venv
source server/.venv/bin/activate
python -m pip install -r server/requirements.txt
```

Then start the backend:

```sh
python -m uvicorn main:app --app-dir server --reload --host localhost --port 8000
```

Leave this terminal running too. You can explore the API at [localhost:8000/docs](http://localhost:8000/docs). SQLite sets itself up automatically; no database account or keys are needed.

On Windows, use `py -3.13 -m venv server/.venv` and activate with `server\.venv\Scripts\Activate.ps1` in PowerShell. The pip and startup commands are the same.
