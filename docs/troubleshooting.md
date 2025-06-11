# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### GHC/GHCi Not Found
- **Problem**: The extension cannot find GHC or GHCi on your system
- **Solution**: 
  1. Install GHCup from https://www.haskell.org/ghcup/
  2. Run `ghcup install ghc`
  3. Add GHCup to your PATH
  4. Restart VS Code

#### Missing Stack
- **Problem**: Stack is required but not installed
- **Solution**:
  1. Install Stack from https://docs.haskellstack.org/
  2. Run `stack setup`
  3. Restart VS Code

### Runtime Issues

#### File Won't Run
- **Problem**: Haskell file fails to run
- **Solutions**:
  1. Ensure file is saved
  2. Check for syntax errors
  3. Verify GHC version compatibility
  4. Check file permissions

#### Function Execution Fails
- **Problem**: Selected function fails to execute
- **Solutions**:
  1. Ensure function is properly defined
  2. Check function signature
  3. Verify required modules are imported
  4. Check REPL status

### REPL Issues

#### REPL Won't Start
- **Problem**: REPL fails to initialize
- **Solutions**:
  1. Check GHCi installation
  2. Verify file path contains no spaces
  3. Check workspace permissions
  4. Try restarting VS Code

#### REPL Hangs
- **Problem**: REPL becomes unresponsive
- **Solutions**:
  1. Use "Restart REPL" command
  2. Check for infinite recursion
  3. Verify memory usage
  4. Close and reopen VS Code

### Environment Issues

#### Path Issues
- **Problem**: Tools not found in PATH
- **Solutions**:
  1. Add GHC/Stack paths manually
  2. Verify environment variables
  3. Check shell configuration

#### Permission Issues
- **Problem**: Cannot execute commands
- **Solutions**:
  1. Check file permissions
  2. Run VS Code as administrator
  3. Verify workspace permissions

## Reporting Issues

If you encounter an issue not covered here:

1. Use the "Report Issue" command in VS Code
2. Fill in the bug report template
3. Include relevant error messages
4. Describe steps to reproduce

## Getting Help

- **Documentation**: [Full Documentation](https://github.com/midhunann/Haskell-Run#readme)
- **Issues**: [GitHub Issues](https://github.com/midhunann/Haskell-Run/issues)
- **Discussions**: [GitHub Discussions](https://github.com/midhunann/Haskell-Run/discussions)
