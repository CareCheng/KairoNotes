@echo off
REM KairoNotes - Quick Build Script for Windows
REM Usage:
REM   build.bat --release    构建标准版到 /dist/release
REM   build.bat --debug      构建开发版到 /dist/debug
REM   build.bat --packmsi    构建 MSI 安装包到 /dist/packmsi
REM   build.bat --packexe    构建 EXE 安装包到 /dist/packexe
REM   build.bat --clean      清理所有构建文件
REM   build.bat --help       显示帮助

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\build.ps1" %*
