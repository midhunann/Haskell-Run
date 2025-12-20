<div align="center">

<img src="resources/haskell-logo.png" alt="Haskell Run Logo" width="128">

# Haskell Run

**Run Haskell code instantly in VS Code — no terminal juggling required**

[![Version](https://img.shields.io/visual-studio-marketplace/v/midhunan.haskellrun?color=blue&label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=midhunan.haskellrun)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/midhunan.haskellrun)](https://marketplace.visualstudio.com/items?itemName=midhunan.haskellrun)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/midhunan.haskellrun)](https://marketplace.visualstudio.com/items?itemName=midhunan.haskellrun)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](/LICENSE)

[Features](#features) • [Quick Start](#quick-start) • [Usage](#usage) • [Configuration](#configuration) • [Troubleshooting](#troubleshooting)

</div>

---

## Overview

**Haskell Run** transforms VS Code into a powerful, interactive Haskell development environment. Execute entire files, run individual functions, and test code snippets with a single click — just like Python's code runner, but designed specifically for Haskell.

![Haskell Run Demo](https://github.com/user-attachments/assets/2da546e0-594a-464c-8614-87fa6f970679)

**Perfect for:**
- **Students** learning Haskell and functional programming concepts
- **Developers** testing functions interactively during development
- **Educators** demonstrating Haskell code with live execution
- **Prototypers** rapidly iterating on ideas with GHCi



---

## Features

### One-Click File Execution
Run complete Haskell programs directly from the editor toolbar without manual compilation.

- **Smart Runner Detection**: Automatically selects `runghc`, `stack runghc`, or `cabal run` based on your project
- **Integrated Terminal Output**: Results appear instantly in VS Code's terminal
- **Auto-Save**: Files are automatically saved before execution to prevent running stale code
- **Multiple Execution Methods**: Toolbar button, keyboard shortcut (`F5`), or command palette

### Interactive Function Execution
Run individual functions without writing test harnesses or `main` functions.

- **CodeLens Integration**: Click the "▶️ Run" button that appears above every function signature
- **Type-Aware Argument Prompting**: Automatically detects when functions need arguments and prompts for input
- **Function Explorer Sidebar**: Browse and execute all functions in your workspace from the dedicated sidebar
- **Text Selection Support**: Highlight any function name and execute it with `Shift+F5`

**Example:**
```haskell
factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n - 1)
-- Click "▶️ Run" above → Enter "5" → Output: 120
```

### Persistent GHCi REPL
Maintain an interactive GHCi session throughout your development workflow.

- **Automatic Module Loading**: Your current file is automatically loaded into the REPL
- **Session Persistence**: REPL state is maintained across function executions
- **Quick Restart**: Restart the REPL with `Ctrl+Alt+K` (macOS: `Cmd+Alt+K`)
- **Output Management**: Clear REPL output with `Ctrl+Alt+L` (macOS: `Cmd+Alt+L`)

### Function Explorer Sidebar
Visualize and navigate all functions in your Haskell files.

- **Real-Time Parsing**: Automatically updates as you edit code
- **Type Signature Display**: Hover over functions to see their complete type signatures
- **One-Click Execution**: Run any function directly from the sidebar
- **Smart Visibility**: Sidebar appears automatically when Haskell files are detected

### Code Snippets
Accelerate development with built-in snippets for common Haskell patterns:

| Trigger | Expands To | Description |
|---------|------------|-------------|
| `hmain` | Complete main module | Creates `module Main where` with main function |
| `hprop` | QuickCheck property | Property-based test template with where clause |
| `hdata` | Data type declaration | ADT with fields and deriving clause |
| `hclass` | Type class definition | Type class with method signature |

### Environment Management
Seamless integration with your Haskell toolchain.

- **Auto-Detection**: Finds GHC, Stack, and Cabal installations automatically
- **Missing Tool Warnings**: Provides actionable installation instructions when tools are missing
- **Path Validation**: Ensures executables are accessible in your system PATH
- **First-Run Welcome**: Helpful onboarding message with documentation links

---

## Quick Start

### Prerequisites

You need **one** of the following Haskell toolchains installed:

**Option 1: GHCup (Recommended)**
```bash
# Install GHCup — includes GHC, Cabal, Stack, and HLS
curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh

# Verify installation
ghc --version
ghci --version
```

**Option 2: Stack**
```bash
# macOS/Linux
curl -sSL https://get.haskellstack.org/ | sh

# Windows (PowerShell)
Invoke-WebRequest https://get.haskellstack.org/ -OutFile stack.ps1
.\stack.ps1

# Verify
stack --version
```

**Option 3: System Package Manager**
```bash
# macOS
brew install ghc cabal-install

# Ubuntu/Debian
sudo apt-get install ghc cabal-install

# Arch Linux
sudo pacman -S ghc cabal-install
```

**Documentation:**
- [GHCup Installation Guide](https://www.haskell.org/ghcup/)
- [Stack Installation Guide](https://docs.haskellstack.org/)

### Install Extension

1. Open VS Code
2. Press `Ctrl+Shift+X` (macOS: `Cmd+Shift+X`)
3. Search for **"Haskell Run"**
4. Click **Install**

**Or install from the command line:**
```bash
code --install-extension midhunan.haskellrun
```

**Or install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=midhunan.haskellrun)**

---

## Usage

### Running Haskell Files

**Method 1: Editor Toolbar (Recommended)**
1. Open any `.hs` file
2. Look for the **▶️ Run** button in the top-right corner of the editor
3. Click the button to execute the file
4. View output in the integrated terminal

**Method 2: Keyboard Shortcut**
- Press `F5` to run the current file
- Or use `Ctrl+Alt+R` (macOS: `Cmd+Alt+R`)

**Method 3: Command Palette**
1. Press `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`)
2. Type "Haskell Run: Run File"
3. Press Enter

**Example file:**
```haskell
-- hello.hs
main :: IO ()
main = do
    putStrLn "Hello from Haskell Run!"
    print $ sum [1..100]
    print $ map (* 2) [1,2,3,4,5]
```

### Running Individual Functions

**Method 1: CodeLens (Easiest)**

Functions with type signatures automatically get a clickable "▶️ Run" button:

```haskell
-- Simple function (no arguments)
greeting :: String
greeting = "Hello, Haskell!"
-- Click "▶️ Run" above this line → Output: "Hello, Haskell!"

-- Function with arguments
add :: Int -> Int -> Int
add x y = x + y
-- Click "▶️ Run" → Enter: 5 10 → Output: 15

-- Higher-order function
applyTwice :: (a -> a) -> a -> a
applyTwice f x = f (f x)
-- Click "▶️ Run" → Enter: (*2) 3 → Output: 12
```

**Method 2: Text Selection**
1. Highlight a function name (e.g., `factorial`)
2. Press `Shift+F5` or `Ctrl+Alt+F` (macOS: `Cmd+Alt+F`)
3. If the function has parameters, enter arguments when prompted
4. View results in the REPL

**Method 3: Function Explorer Sidebar**
1. Click the Haskell Run icon in the Activity Bar (left sidebar)
2. Browse the list of all functions in your current file
3. Click any function to execute it
4. The sidebar shows function names and their type signatures

**Interactive Argument Entry:**

When you run a function that requires arguments, you'll see an input prompt:

```haskell
power :: Integer -> Integer -> Integer
power base exp = base ^ exp

-- After clicking "▶️ Run":
-- Input prompt: "Enter arguments for power :: Integer -> Integer -> Integer"
-- You enter: 2 10
-- Output: 1024
```

### REPL Management

**Restart REPL:**
- **Keyboard**: `Ctrl+Alt+K` (macOS: `Cmd+Alt+K`)
- **Command Palette**: "Haskell Run: Restart REPL"
- **Use when**: REPL becomes unresponsive or you need a clean state

**Clear REPL Output:**
- **Keyboard**: `Ctrl+Alt+L` (macOS: `Cmd+Alt+L`)
- **Command Palette**: "Haskell Run: Clear REPL"
- **Use when**: Output is cluttered and you want to start fresh

**Note:** The REPL automatically loads your current module when you execute functions. You don't need to manually run `:load` commands.

---

## Configuration

Access settings via `File > Preferences > Settings` (macOS: `Code > Preferences > Settings`), then search for "Haskell Run".

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `haskellRun.defaultRunner` | String | `"runghc"` | Command to execute Haskell files. Options: `"runghc"`, `"stack runghc"`, `"cabal run"` |
| `haskellRun.enableCodeLens` | Boolean | `true` | Show "▶️ Run" buttons above function signatures |
| `haskellRun.reuseTerminal` | Boolean | `true` | Reuse the same terminal for multiple executions |
| `haskellRun.timeout` | Number | `30000` | Maximum execution time in milliseconds (30 seconds) |
| `haskellRun.enableTelemetry` | Boolean | `false` | Send anonymous usage data to help improve the extension |

### Configuration Examples

**For Stack projects:**
```json
{
  "haskellRun.defaultRunner": "stack runghc",
  "haskellRun.timeout": 60000
}
```

**For Cabal projects:**
```json
{
  "haskellRun.defaultRunner": "cabal run",
  "haskellRun.reuseTerminal": true
}
```

**Minimal GHC setup:**
```json
{
  "haskellRun.defaultRunner": "runghc",
  "haskellRun.enableCodeLens": true
}
```

### Keyboard Shortcuts

All keyboard shortcuts can be customized via `File > Preferences > Keyboard Shortcuts`.

| Command | Windows/Linux | macOS | Description |
|---------|---------------|-------|-------------|
| **Run File** | `F5` or `Ctrl+Alt+R` | `F5` or `Cmd+Alt+R` | Execute the current Haskell file |
| **Run Function/Selection** | `Shift+F5` or `Ctrl+Alt+F` | `Shift+F5` or `Cmd+Alt+F` | Run selected function or text |
| **Restart REPL** | `Ctrl+Alt+K` | `Cmd+Alt+K` | Restart the GHCi REPL session |
| **Clear REPL** | `Ctrl+Alt+L` | `Cmd+Alt+L` | Clear REPL output |

---

## Troubleshooting

### Common Issues

**"GHC/GHCi not found" error**

**Cause:** GHC is not installed or not in your system PATH.

**Solution:**
1. Install GHC via GHCup (recommended):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh
   ```
2. Verify GHC is in your PATH:
   ```bash
   which ghc    # macOS/Linux
   where ghc    # Windows
   ```
3. Restart VS Code
4. If the error persists, manually add GHC to your PATH:
   - **macOS/Linux**: Add to `~/.bashrc` or `~/.zshrc`:
     ```bash
     export PATH="$HOME/.ghcup/bin:$PATH"
     ```
   - **Windows**: Add `C:\ghcup\bin` to System Environment Variables

**Function execution fails silently**

**Cause:** Module not loaded, syntax errors, or REPL crash.

**Solutions:**
1. Check for syntax errors (red squiggles in the editor)
2. Ensure the file is saved (`Ctrl+S` / `Cmd+S`)
3. Restart the REPL: `Ctrl+Alt+K` (macOS: `Cmd+Alt+K`)
4. Check the Output panel: `View > Output` → Select "Haskell Run"
5. Verify your function has a type signature (required for CodeLens)

**"Missing Stack" or "Missing Cabal" warning**

**Cause:** You selected a runner that isn't installed.

**Solution 1 — Install the missing tool:**
```bash
# Install Stack
curl -sSL https://get.haskellstack.org/ | sh

# Install Cabal via GHCup
ghcup install cabal
```

**Solution 2 — Change the runner:**
```json
{
  "haskellRun.defaultRunner": "runghc"
}
```

**REPL hangs or becomes unresponsive**

**Causes:** Infinite recursion, long-running computation, or memory issues.

**Solutions:**
1. Restart the REPL: `Ctrl+Alt+K` (macOS: `Cmd+Alt+K`)
2. Check your code for infinite loops or recursion without base cases
3. Close the terminal manually and reopen
4. Reload the VS Code window: `Ctrl+R` (macOS: `Cmd+R`)
5. Increase timeout in settings if legitimate long-running code:
   ```json
   { "haskellRun.timeout": 120000 }
   ```

**CodeLens "▶️ Run" buttons not appearing**

**Causes:** CodeLens disabled, missing type signatures, or language server conflict.

**Solutions:**
1. Enable CodeLens in settings:
   ```json
   { "haskellRun.enableCodeLens": true }
   ```
2. Ensure all functions have type signatures:
   ```haskell
   myFunction :: Int -> Int  -- Required
   myFunction x = x * 2
   ```
3. Reload the window: `Ctrl+R` (macOS: `Cmd+R`)
4. Check for conflicts with other Haskell extensions

**Extension doesn't activate**

**Cause:** No Haskell files in workspace.

**Solution:** The extension only activates when `.hs` files are present. Create or open a Haskell file to trigger activation.

### Getting Help

If you encounter issues not covered above:

1. **Check Output Logs**: `View > Output` → Select "Haskell Run" from dropdown
2. **Report a Bug**: Use Command Palette → "Haskell Run: Report Issue" (auto-fills system info)
3. **Read Full Guide**: [Troubleshooting Documentation](docs/troubleshooting.md)
4. **Search Existing Issues**: [GitHub Issues](https://github.com/midhunann/Haskell-Run/issues)
5. **Ask for Help**: [GitHub Discussions](https://github.com/midhunann/Haskell-Run/discussions)

---

## Contributing

Contributions are welcome and appreciated. Here's how you can help:

**Report Bugs**
- Use the built-in issue reporter: Command Palette → "Haskell Run: Report Issue"
- Or [open an issue manually](https://github.com/midhunann/Haskell-Run/issues/new)
- Include: VS Code version, OS, GHC version, steps to reproduce

**Suggest Features**
- [Start a discussion](https://github.com/midhunann/Haskell-Run/discussions) to propose ideas
- Check existing issues to avoid duplicates

**Submit Pull Requests**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `pnpm test` (or `npm test`)
5. Commit with clear messages: `git commit -m "feat: add function signature detection"`
6. Push and open a PR

**Improve Documentation**
- Fix typos, improve clarity, add examples
- Update troubleshooting guides with solutions you discovered

### Development Setup

```bash
# Clone the repository
git clone https://github.com/midhunann/Haskell-Run.git
cd Haskell-Run

# Install dependencies
pnpm install  # or: npm install

# Open in VS Code
code .

# Start watch mode for development
pnpm run watch  # or: npm run watch

# Run in Extension Development Host
# Press F5 in VS Code to launch a new window with the extension loaded
```

**Project Structure:**
- `src/extension.ts` — Main extension entry point
- `src/providers/codeLens.ts` — CodeLens provider for "▶️ Run" buttons
- `src/providers/treeView.ts` — Function Explorer sidebar
- `src/utils/repl.ts` — GHCi REPL session management
- `src/utils/environment.ts` — Environment detection and validation
- `src/utils/diagnostics.ts` — Error handling and diagnostics

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

You are free to use, modify, and distribute this software for any purpose, commercial or non-commercial, with attribution.

---

## Acknowledgments

- **Haskell Community** — For creating an exceptional language and fostering a welcoming ecosystem
- **VS Code Team** — For providing a powerful, extensible editor platform
- **Contributors** — Everyone who has reported issues, suggested features, or submitted code

---

## Support & Feedback

**Bug Reports**
- [GitHub Issues](https://github.com/midhunann/Haskell-Run/issues)

**Feature Requests**
- [GitHub Discussions](https://github.com/midhunann/Haskell-Run/discussions)

**Questions & Help**
- [GitHub Discussions Q&A](https://github.com/midhunann/Haskell-Run/discussions/categories/q-a)

**Rate & Review**
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=midhunan.haskellrun&ssr=false#review-details)

**Star this Repository**
- [GitHub Repository](https://github.com/midhunann/Haskell-Run)

---

<div align="center">

**Made for the Haskell community**

If this extension improves your workflow, consider starring the repository or leaving a review on the VS Code Marketplace!

</div>

