"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KingsoftAirscript = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class KingsoftAirscript {
    constructor() {
        this.description = {
            displayName: 'Kingsoft AirScript',
            name: 'kingsoftAirscript',
            icon: 'file:kingsoftAirscript.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: '一个通用的金山 AirScript 执行器。访问 <a href="https://www.kdocs.cn/l/cho73TDGgMPP">官方指南 & 脚本库</a> 获取更多帮助',
            defaults: {
                name: 'Kingsoft AirScript',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'kingsoftAirscriptApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: '操作',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        { name: '同步执行脚本 (Sync)', value: 'runScriptSync', action: '同步执行一个脚本并立即等待结果' },
                        { name: '异步执行脚本 (Async)', value: 'runScriptAsync', action: '异步执行一个脚本并立即返回任务ID' },
                        { name: '获取任务状态 (Get Status)', value: 'getTaskStatus', action: '根据任务ID获取脚本的执行状态和结果' },
                    ],
                    default: 'runScriptSync',
                },
                {
                    displayName: 'Webhook 链接',
                    name: 'webhookUrl',
                    type: 'string',
                    default: '',
                    placeholder: '推荐！在此粘贴从金山文档复制的完整链接',
                    description: '粘贴链接可自动识别 File ID 和 Script ID，无需手动填写下面两项。',
                    displayOptions: {
                        show: {
                            operation: ['runScriptSync', 'runScriptAsync'],
                        },
                    },
                },
                {
                    displayName: '文件 ID (File ID)',
                    name: 'fileId',
                    displayOptions: {
                        show: {
                            operation: [
                                'runScriptSync',
                                'runScriptAsync',
                            ],
                        },
                    },
                    type: 'string',
                    default: '',
                    description: '运行脚本所在文档的文件 ID如果未提供 Webhook URL，则必须手动填写此项。',
                },
                {
                    displayName: '脚本 ID (Script ID)',
                    name: 'scriptId',
                    displayOptions: {
                        show: {
                            operation: [
                                'runScriptSync',
                                'runScriptAsync',
                            ],
                        },
                    },
                    type: 'string',
                    default: '',
                    description: '要运行的脚本的 ID如果未提供 Webhook URL，则必须手动填写此项。',
                },
                {
                    displayName: '可选上下文参数',
                    name: 'contextParameters',
                    type: 'collection',
                    placeholder: '添加可选参数',
                    default: {},
                    description: '设置可选的 Context 参数，会附加到请求中',
                    displayOptions: {
                        show: {
                            operation: ['runScriptSync', 'runScriptAsync'],
                        },
                    },
                    options: [
                        { displayName: '表名 (Sheet Name)', name: 'sheetName', type: 'string', default: '', description: '对应 Context.sheet_name' },
                        { displayName: '范围 (Range)', name: 'range', type: 'string', default: '', description: '对应 Context.range, 例如 "$B$156"' },
                        { displayName: '链接来源 (Link From)', name: 'linkFrom', type: 'string', default: '', description: '对应 Context.link_from' },
                        { displayName: '视图名称 (DB Active View)', name: 'dbActiveView', type: 'string', default: '', description: '对应 Context.db_active_view' },
                        { displayName: '选区 (DB Selection)', name: 'dbSelection', type: 'string', default: '', description: '对应 Context.db_selection' },
                    ],
                },
                {
                    displayName: '脚本参数 (Argv)',
                    name: 'argv',
                    type: 'json',
                    default: '{\n  "message": "Hello from n8n!"\n}',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: [
                                'runScriptSync',
                                'runScriptAsync',
                            ],
                        },
                    },
                    description: '以 JSON 格式向脚本传递动态参数。不知道如何为您的业务场景构建参数？欢迎访问我们的[脚本模板库](https://www.kdocs.cn/l/cho73TDGgMPP)寻找灵感。',
                },
                {
                    displayName: '任务 ID (Task ID)',
                    name: 'taskId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: [
                                'getTaskStatus',
                            ],
                        },
                    },
                    description: '从异步执行脚本操作中获取到的任务 ID',
                },
            ],
            usableAsTool: true,
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('kingsoftAirscriptApi');
        const operation = this.getNodeParameter('operation', 0, '');
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                if (operation === 'runScriptSync' || operation === 'runScriptAsync') {
                    let fileId = this.getNodeParameter('fileId', i, '');
                    let scriptId = this.getNodeParameter('scriptId', i, '');
                    const webhookUrl = this.getNodeParameter('webhookUrl', i, '');
                    if (webhookUrl) {
                        const match = webhookUrl.match(/file\/(.*?)\/script\/(.*?)\//);
                        if (match && match[1] && match[2]) {
                            fileId = match[1];
                            scriptId = match[2];
                        }
                        else {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Webhook URL 格式不正确，无法解析出 File ID 和 Script ID。');
                        }
                    }
                    if (!fileId || !scriptId) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), '必须提供 Webhook URL 或手动填写 File ID 和 Script ID。');
                    }
                    const argvString = this.getNodeParameter('argv', i, '{}');
                    const contextParameters = this.getNodeParameter('contextParameters', i, {});
                    const argv = JSON.parse(argvString);
                    const context = { argv };
                    if (contextParameters.sheetName)
                        context.sheet_name = contextParameters.sheetName;
                    if (contextParameters.range)
                        context.range = contextParameters.range;
                    if (contextParameters.linkFrom)
                        context.link_from = contextParameters.linkFrom;
                    if (contextParameters.dbActiveView)
                        context.db_active_view = contextParameters.dbActiveView;
                    if (contextParameters.dbSelection)
                        context.db_selection = contextParameters.dbSelection;
                    const body = { Context: context };
                    const url = operation === 'runScriptSync'
                        ? `https://www.kdocs.cn/api/v3/ide/file/${fileId}/script/${scriptId}/sync_task`
                        : `https://www.kdocs.cn/api/v3/ide/file/${fileId}/script/${scriptId}/task`;
                    responseData = await this.helpers.httpRequest({
                        method: 'POST',
                        url: url,
                        headers: {
                            'Content-Type': 'application/json',
                            'AirScript-Token': credentials.apiToken,
                        },
                        body: body,
                        json: true,
                    });
                }
                else if (operation === 'getTaskStatus') {
                    const taskId = this.getNodeParameter('taskId', i, '');
                    const url = `https://www.kdocs.cn/api/v3/script/task`;
                    const options = {
                        method: 'GET',
                        url: url,
                        headers: { 'Content-Type': 'application/json' },
                        qs: { task_id: taskId },
                        json: true,
                    };
                    responseData = await this.helpers.httpRequest(options);
                }
                if (responseData) {
                    returnData.push({ json: responseData, pairedItem: { item: i } });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
                    continue;
                }
                throw error;
            }
        }
        return [this.helpers.returnJsonArray(returnData)];
    }
}
exports.KingsoftAirscript = KingsoftAirscript;
//# sourceMappingURL=KingsoftAirscript.node.js.map