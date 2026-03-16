---
description: 自动生成 app/index.ts 构建入口文件，聚合导出所有 app 目录下的模块。
---

# 构建入口生成工作流

该工作流用于自动扫描 `app` 目录下的所有模块，并将它们聚合导出到 `app/index.ts` 中。

## 实现细节

1. **扫描目录**：递归扫描 `app` 目录下所有的 `.ts` 和 `.js` 文件（排除 `index.ts` 本身）。
2. **分析导出**：识别每个文件的默认导出（Default Export）和具名导出（Named Export）。
3. **生成重导出语句**：
   - 优先使用具名导出。
   - 对于默认导出，使用文件名作为变量名，并增加目录前缀以避免重名。
   - 规则：`export { default as [DirectoryName][FileName] } from './[Path]'`。
4. **写入文件**：覆盖写入到 `app/index.ts`。

## 操作指令

// turbo
1. 请扫描 `app` 目录下除 `index.ts` 以外的所有源代码文件。
2. 为每个文件生成重导出语句。
   - 如果文件是 `app/controller/user.ts` 且包含默认导出，则导出为 `UserController`（如果冲突则带上更完整的路径）。
   - 确保没有重复的导出名称。
3. 将结果写入 `app/index.ts`。
