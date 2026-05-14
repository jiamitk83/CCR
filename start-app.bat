@echo off 
start /b npm start 
timeout /t 5 /nobreak > nul 
start http://localhost:3000 
