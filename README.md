# Haskell Run - VS Code Extension
Haskell Run is a simple VS Code extension that allows users to run Haskell code with a single button click.

## Features
- **One-click execution** of Haskell programs.
- **Run individual functions** directly from the editor.
- **Automatic detection of function names** to prompt for arguments if required.
- **Supports GHCi integration** for interactive execution.
- **Works with all VS Code versions** (starting from `1.76.0` and above).

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

## Configuration
This extension automatically detects GHC and GHCi installations. If GHCi is not found, ensure it is installed and available in your system path.

## Troubleshooting
- If the extension does not run your Haskell file, ensure GHCi is installed and accessible via the command line.
- For Windows users, add GHCi to the system PATH.
- If you encounter permission issues, try running VS Code as an administrator.

## License
This project is licensed under the **MIT License**.

## Contributing
We welcome contributions! Feel free to open issues, fork the repository, and submit pull requests.

## Feedback & Support
- **Issues & Bug Reports:** [GitHub Issues](https://github.com/midhunann/Haskell-Run/issues)
- **Discussions & Suggestions:** [GitHub Discussions](https://github.com/midhunann/Haskell-Run/discussions)

