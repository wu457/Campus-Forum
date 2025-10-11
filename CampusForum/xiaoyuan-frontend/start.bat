@REM @echo off
@REM echo 正在启动校园论坛管理系统...

@REM echo 初始化数据库...
@REM cd src\app
@REM python init_db.py

@REM echo 启动后端服务...
@REM start cmd /k "cd src\app && python app.py"

@REM echo 等待后端服务启动...
@REM timeout /t 5

@REM echo 启动前端服务...
@REM start cmd /k "ng serve --open"

@REM echo 系统启动完成！
@REM echo 前端地址: http://localhost:4200
@REM echo 后端地址: http://localhost:5000