# @rome/cli
遇事不决，求help
``` js
rome -h 
```

## 全局使用
``` js
npm install -g @rome/cli
# 查看帮助文档
rome -h

# 业务组件规范校验
rome npmCheck

# 工程规范校验
rome dirCheck
```

## 单独测试
### 依赖规范校验本地测试
``` js
yarn depTest
```

### 目录规范校验本地测试
``` js
yarn dirTest
```

## 开发相关
目前talos插件项目也被融合到该项目
### 脚手架命令入口
``` js
bin/index.js
```

### talos插件构建入口
``` js
bin/build.js
```

### 校验逻辑入口
卡控的还是在check下，check/directory和check/dependency
``` js
# 目录校验
check/directory
```
``` js
# 依赖校验
check/dependency
```