# Chair-Fass

Chair Fass HTTP 服务调用举例


## 初始化

```bash
$ tnpm install
```

## 启动本地服务

```bash
$ tnpm run dev
```

## 构建

```bash
$ tnpm run build
```

## 部署

部署前需要设置 ak/sk/webgw_app_id 配置：

`vi ~/.apc/config.json`

```json
{
  "ak": "xxx",
  "sk": "xxx",
  "webgw_app_id": "180020010001286502" // 灵光固定用这个
}
```

传入 `PLATFORM_ID` 和 `env` 部署指定应用和环境：
```bash
$ PLATFORM_ID=<id> tnpm run deploy -- --env <dev|pre|prod>
```

部署脚本会自动执行以下操作：

1. 生成 `dist/manifest.json`（服务端构建元信息）
2. 生成 `dist/unio.config.json`（包含 `platformId`）
3. 生成 `dist/client/index.html`
4. 将服务端入口文件注入 `NODE_PATH` 配置
5. 通过 `apc publish` 发布到开发环境

