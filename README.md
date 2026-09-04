# Scientific Calculator

A browser-based scientific calculator with degree/radian modes, memory controls, and calculation history.

The calculator runs entirely in the browser, so it can be hosted on GitHub Pages without Python.

## Open on GitHub Pages

1. Push the project to a GitHub repository.
2. On GitHub, open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then choose **Save**.
5. Open the Pages URL GitHub provides, usually:

   ```text
   https://<your-github-username>.github.io/<repository-name>/
   ```

Share that URL with users. They only need a modern web browser.

## Run locally

To test the static version locally, open `index.html` in a browser. Python is optional. To use the included Python server instead:

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

The Python server is retained as an optional alternative for local use. It is not required by the browser calculator.