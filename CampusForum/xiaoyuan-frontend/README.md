# 校园论坛前端

这是一个基于 Angular 构建的校园论坛前端项目。

## 主要功能

*   用户注册和登录
*   帖子浏览、发布、删除
*   评论功能
*   按板块筛选帖子
*   后台管理（帖子管理）

## 技术栈

*   [Angular](https://angular.io/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [SCSS](https://sass-lang.com/)

## 本地开发

1.  **克隆项目**
    ```bash
    git clone https://github.com/your-username/xiaoyuanBBS-frontend.git
    cd xiaoyuanBBS-frontend
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **运行开发服务器**
    ```bash
    ng serve --open
    ```
    应用将在 `http://localhost:4200/` 上运行。

## 项目结构

```
.
├── src
│   ├── app
│   │   ├── admin       # 后台管理模块
│   │   ├── core        # 核心服务和模型
│   │   ├── post        # 帖子相关组件
│   │   ├── section     # 板块相关组件
│   │   ├── shared      # 共享组件和模块
│   │   └── user        # 用户相关组件
│   ├── assets          # 静态资源
│   └── environments    # 环境配置
└── ...
```
