@echo off

node --max-old-space-size=8192 "%~dp0\run" %*
