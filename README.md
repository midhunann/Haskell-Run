# Haskell Run - VS Code Extension
Haskell Run is a simple VS Code extension that allows users to run Haskell code with a single button click.
![Screen Recording 2025-12-11 at 00 04 51](https://github.com/user-attachments/assets/2da546e0-594a-464c-8614-87fa6f970679)

---

## Features
- **One-click execution** of Haskell programs
- **Run individual functions** directly from the editor
- **Automatic tool installation** for missing dependencies
- **High-contrast theme support** for accessibility
- **Integrated REPL management**
- **Code snippets** for common Haskell patterns
- **Comprehensive error handling** with quick fixes
- **Detailed troubleshooting guide**

## Usage Guide
### **Running a Haskell File**
1. Open any `.hs` file in VS Code.
2. Click the **Run Haskell** ▶️ button in the editor toolbar.
3. The output will be displayed in the **VS Code terminal**.

### **Running a Specific Function**
1. Highlight the function you want to run.
2. Right-click and select **Run Haskell Function**.
3. If the function requires arguments, an input box will appear where you can enter them.
4. Press **Enter**, and the function will execute in GHCi.


## 🛠️ Installation
### From VS Code Marketplace:
1. Open VS Code and navigate to **Extensions** (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).
2. Search for **Haskell Run**.
3. Click **Install** and restart VS Code if necessary.

### From GitHub:
1. Clone this repository:
   ```sh
   git clone https://github.com/midhunann/Haskell-Run.git
   ```
2. Open the project in VS Code.
3. Install dependencies:
   ```sh
   npm install
   ```
4. Run the extension in development mode:
   ```sh
   npm run compile
   code --extensionDevelopmentPath=.
   ```

## Motive
While working with Haskell, students and developers often face challenges with manual compilation and execution of functions. **Haskell Run** was created to simplify this process, allowing users to:
- Run Haskell scripts effortlessly with a single click.
- Execute individual functions without needing to manually type them in the terminal.
- Improve workflow efficiency by integrating execution seamlessly within VS Code.

## Keyboard Shortcuts

| Command | Windows/Linux | macOS |
|---------|--------------|-------|
| Run Haskell File | `Ctrl+Alt+R` | `Cmd+Alt+R` |
| Run Selected Function | `Ctrl+Alt+F` | `Cmd+Alt+F` |
| Restart REPL | `Ctrl+Alt+K` | `Cmd+Alt+K` |
| Clear REPL | `Ctrl+Alt+L` | `Cmd+Alt+L` |

## Code Snippets

| Prefix | Description |
|--------|-------------|
| `hmain` | Create a Haskell main function |
| `hprop` | Create a QuickCheck property |
| `hdata` | Create a Haskell data type |
| `hclass` | Create a Haskell type class |

## Configuration

The following settings are available:

- `haskellRun.defaultRunner`: Choose between 'runghc', 'stack runghc', or 'cabal run'
- `haskellRun.timeout`: Set timeout for long-running scripts (default: 30000ms)
- `haskellRun.reuseTerminal`: Reuse existing terminal (default: true)
- `haskellRun.enableTelemetry`: Enable anonymous usage data collection (default: false)

## Troubleshooting

See our detailed [Troubleshooting Guide](docs/troubleshooting.md) for solutions to common issues.

## License
This project is licensed under the **MIT License**.

## Contributing
We welcome contributions! Feel free to open issues, fork the repository, and submit pull requests.

## Feedback & Support
- **Issues & Bug Reports:** [GitHub Issues](https://github.com/midhunann/Haskell-Run/issues)
- **Discussions & Suggestions:** [GitHub Discussions](https://github.com/midhunann/Haskell-Run/discussions)

