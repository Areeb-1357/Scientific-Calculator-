# Scientific Calculator

A browser-based scientific calculator with degree/radian modes, memory controls, calculation history, and a Python API server.

## Run locally

1. Install Python 3.8 or newer.
2. Open a terminal in this project folder.
3. Start the calculator server:

   ```powershell
   python main.py
   ```

4. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser.

Keep the terminal running while using the calculator. Press `Ctrl+C` in the terminal to stop the server.

## Features

- Addition, subtraction, multiplication, division, and powers
- `sin`, `cos`, `tan`, `log`, `ln`, and square root
- Degree and radian angle modes
- Constants `pi` and `e`
- Memory controls and recent calculation history
- Keyboard input, including `Enter`, `Escape`, and `Backspace`

## GitHub and public access

GitHub stores the source code but does not run the Python API. Other users can download the repository, install Python, run `python main.py`, and open the local address in their own browser.

To give everyone one shared public URL, deploy the project to a Python-capable hosting service such as Render, Railway, or PythonAnywhere. Configure the service to run:

```text
python main.py
```

The service must provide the `PORT` environment variable to the application. GitHub Pages alone is not sufficient because it cannot run `main.py`.

Set these environment variables in the hosting service:

```text
HOST=0.0.0.0
PORT=<the port supplied by the host>
```