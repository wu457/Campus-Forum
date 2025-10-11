# 校园论坛管理系统
这是一个完整的校园论坛管理系统，包含前端Angular应用和后端Flask API服务，为校园社区提供全面的论坛功能和管理后台。
## 系统架构
- 前端 : Angular 19 + TypeScript + SCSS
- 后端 : Flask + SQLAlchemy + MySQL
- 数据库 : MySQL 8.0+
- 文件存储 : 本地文件系统（头像和帖子图片）
## 主要功能
### 用户功能
- ✅ 用户注册和登录
- ✅ 个人资料管理（用户名、邮箱、头像）
- ✅ 密码修改
- ✅ 帖子发布（支持多图上传）
- ✅ 帖子浏览和搜索
- ✅ 评论功能
- ✅ 点赞和收藏帖子
- ✅ 查看个人帖子、点赞和收藏记录
### 论坛功能
- ✅ 多板块分类管理
- ✅ 帖子按板块筛选
- ✅ 图片上传和预览
- ✅ 实时评论系统
- ✅ 帖子搜索功能
- ✅ 分页浏览
### 管理员功能
- ✅ 数据统计仪表板（用户、帖子、评论统计）
- ✅ 用户管理（角色编辑、删除）
- ✅ 板块管理（创建、编辑、删除）
- ✅ 帖子管理（查看、删除）
- ✅ 权限管理系统
- ✅ 可视化统计图表
## 技术栈
### 前端技术
- 框架 : Angular 19
- 语言 : TypeScript
- 样式 : SCSS/CSS
- 图表 : Chart.js
- HTTP客户端 : Angular HttpClient
- 路由 : Angular Router
### 后端技术
- 框架 : Flask
- ORM : SQLAlchemy
- 数据库 : MySQL
- 认证 : JWT Token
- 跨域 : Flask-CORS
- 文件上传 : Werkzeug
## 数据库设计
系统使用MySQL数据库，主要数据表包括：

- user - 用户表（id, username, email, password, avatar, role）
- section - 板块表（id, name, description, created_at）
- post - 帖子表（id, title, content, images, section_id, user_id, created_at）
- comment - 评论表（id, content, post_id, user_id, created_at）
- postlike - 点赞表
- favorite - 收藏表
- permission - 权限表
- role - 角色表
## 数据库设计
系统使用MySQL数据库，主要数据表包括：

- user - 用户表（id, username, email, password, avatar, role）
- section - 板块表（id, name, description, created_at）
- post - 帖子表（id, title, content, images, section_id, user_id, created_at）
- comment - 评论表（id, content, post_id, user_id, created_at）
- postlike - 点赞表
- favorite - 收藏表
- permission - 权限表
- role - 角色表



