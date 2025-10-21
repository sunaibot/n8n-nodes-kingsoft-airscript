# n8n 节点：金山 AirScript 通用执行器

<!-- 徽章，发布到 npm 后，这里的链接会自动生效 -->
[![NPM Version](https://img.shields.io/npm/v/n8n-nodes-kingsoft-airscript?style=flat-square)](https://www.npmjs.com/package/n8n-nodes-kingsoft-airscript)
[![NPM Downloads](https://img.shields.io/npm/dm/n8n-nodes-kingsoft-airscript?style=flat-square)](https://www.npmjs.com/package/n8n-nodes-kingsoft-airscript)
[![License](https://img.shields.io/npm/l/n8n-nodes-kingsoft-airscript?style=flat-square)](https://github.com/your-username/n8n-nodes-kingsoft-airscript/blob/main/LICENSE)
<!-- 请在你的 GitHub 仓库创建 LICENSE 文件，通常选择 MIT License -->

这是一个为 [n8n](https://n8n.io/) 设计的社区节点，它打通了 n8n 与 [金山 AirScript](https://kdocs.cn/l/cdLp4aUrAR4r) 之间的桥梁，让您可以在 n8n 工作流中，安全、灵活地执行任何 AirScript 脚本。

> ### 🚀 **这不仅仅是一个节点，更是一个赋能工具！**
>
> 本节点的核心价值，在于配合我们为您精心封装的 **[AirScript 中文函数库](https://www.kdocs.cn/l/cho73TDGgMPP)** 使用。您无需从零开始，即可在脚本中调用强大的中文函数，轻松实现复杂的数据处理和自动化任务。
>
> **[点击查阅函数库 & 完整使用指南](https://www.kdocs.cn/l/cho73TDGgMPP)**

---

- [功能特性](#功能特性)
- [安装](#安装)
- [快速开始 (5分钟配置)](#快速开始-5分钟配置)
- [节点用法详解](#节点用法详解)
- [高级用法：动态参数与表达式](#高级用法动态参数与表达式)
- [实战演练：自动化处理新订单](#实战演练自动化处理新订单)
- [获取帮助与支持](#获取帮助与支持)
- [兼容性](#兼容性)

## 功能特性

-   ✅ **多种执行模式**：支持同步执行（等待结果）和异步执行（立即返回任务ID）。
-   ✅ **完整的参数支持**：支持向脚本传递 `argv`, `sheet_name`, `range` 等所有 `Context` 参数。
-   ✅ **异步流程闭环**：提供了“获取任务状态”操作，可与异步执行完美配合，实现长时间运行任务的轮询。
-   ✅ **安全可靠**：您的 AirScript Token 被安全地存储在 n8n 的凭证库中，并通过凭证测试功能确保有效性。
-   ✅ **灵活的表达式支持**：所有输入字段均支持 n8n 表达式，可实现完全动态的工作流。

## 安装

在您的 n8n 实例中，进入 **Settings > Community Nodes**，搜索 `n8n-nodes-kingsoft-airscript` 并安装。

更多细节请参考 n8n 官方的 [社区节点安装指南](https://docs.n8n.io/integrations/community-nodes/installation/)。

## 快速开始 (5分钟配置)

1.  **获取 AirScript Token**：
    *   在金山多维表或电子表格中，打开脚本编辑器。
    *   点击工具栏的【脚本令牌（beta）】按钮，创建并复制您的个人脚本令牌（APIToken）。
2.  **在 n8n 中添加凭证**：
    *   在 n8n 的 "Credentials" 页面，点击 "Add credential"。
    *   搜索并选择 "Kingsoft AirScript API"。
    *   将您复制的 Token 粘贴进去并保存。

## 节点用法详解

### 操作 (Operation)

-   **Run Script (Sync)**: 同步执行脚本。适用于耗时较短、且下一步骤需要立刻使用其返回结果的场景。
-   **Run Script (Async)**: 异步执行脚本。适用于耗时较长的批量任务，它会立即返回一个 `task_id` 而不阻塞工作流。
-   **Get Task Status**: 获取任务状态。配合异步执行使用，通过上一步获得的 `task_id` 来查询任务的最终结果。

### 核心参数

-   **File ID / Script ID**: 执行一个已保存在金山文档里的脚本时，需要提供这两个 ID。**支持表达式**。
-   **Sheet Name, Range, etc.**: 可选参数，用于向脚本的 `Context` 传递环境信息。**支持表达式**。
-   **Parameters (argv)**: 一个强大的 JSON 输入框，用于向您的脚本传递任意自定义的动态数据。这是实现复杂逻辑的关键。

## 高级用法：动态参数与表达式

本节点的所有输入框都支持 n8n 的表达式功能。这意味着您可以从上一个节点动态地获取这些值，实现更高级的自动化。

**示例：动态执行不同表格的脚本**

假设您的上一个节点返回了如下数据：
```json
{
  "targetFile": "f-xxxxxxxx",
  "targetScript": "s-yyyyyyyy",
  "targetSheet": "2024年10月销售数据",
  "payload": {
    "action": "daily_report"
  }
}
```

您可以在本节点的参数中这样设置：
-   **File ID**: `{{ $json.targetFile }}`
-   **Script ID**: `{{ $json.targetScript }}`
-   **Sheet Name**: `{{ $json.targetSheet }}`
-   **Parameters (argv)**: `{{ $json.payload }}`

这样，节点就会根据上游数据，自动地、动态地执行正确的脚本。

## 实战演练：自动化处理新订单

这是一个常见场景：当你的网店有新订单时，自动将其信息写入金山多V维表。

1.  使用 n8n 的 "Webhook" 节点接收新订单数据。
2.  连接到我们的 "Kingsoft AirScript" 节点。
3.  在节点中进行如下配置：
    *   **Operation**: `Run Script (Sync)`
    *   **File ID / Script ID**: 填入您用于处理订单的脚本 ID。
    *   **Sheet Name**: `订单总表`
    *   **Parameters (argv)**: 使用表达式，将 Webhook 收到的数据映射过去。
        ```json
        {
          "orderNumber": "{{ $json.body.order_id }}",
          "customerName": "{{ $json.body.customer.name }}",
          "amount": "{{ $json.body.total_price }}"
        }
        ```
4.  在您的 AirScript 脚本中，通过 `Context.argv` 获取这些数据，并执行您需要的逻辑。

> **想让这一切变得更简单？**
>
> 我们的 **[中文函数库](https://www.kdocs.cn/l/cho73TDGgMPP)** 提供了现成的函数来处理数据。同时，我们也提供 **[开箱即用的 n8n 工作流模板](https://www.kdocs.cn/l/cho73TDGgMPP)**，下载导入，只需修改少量参数即可使用！

## 获取帮助与支持

-   **社区支持**: 如果您在使用节点时遇到 bug 或有功能建议，欢迎在我们的 [GitHub 仓库](https://github.com/your-username/n8n-nodes-kingsoft-airscript) 提交 Issue，或在 [n8n 社区论坛](https://community.n8n.io/) 发帖。
    <!-- 请把上面的 GitHub 链接替换成你的真实仓库地址 -->
-   **专业支持与定制服务**: 如果您的企业需要：
    *   优先的技术支持响应。
    *   针对您业务流程的 AirScript 脚本定制开发。
    *   复杂的 n8n 工作流咨询与搭建。
    *   请通过我们的 **[官方文档与联系方式](https://www.kdocs.cn/l/cho73TDGgMPP)** 了解详情。

## 兼容性

-   **最低 n8n 版本**: `1.0.0`
-   **测试通过的 n8n 版本**: `1.15.3`
    <!-- 当你运行 npm run dev 时，命令行会显示 n8n 的版本号，请把它填在这里 -->

---

> **感谢您使用 n8n 节点：金山 AirScript 通用执行器！**