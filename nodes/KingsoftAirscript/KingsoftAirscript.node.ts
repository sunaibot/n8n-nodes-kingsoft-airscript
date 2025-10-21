// 从 n8n 的核心库里，导入一堆必要的工具
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IDataObject,
    NodeOperationError,
} from 'n8n-workflow';

// 这里定义我们节点的主体
export class KingsoftAirscript implements INodeType {
    // 'description' 对象描述了节点的所有静态信息（外观、名字、输入输出等）
    description: INodeTypeDescription = {
        // 在 n8n 节点面板里显示的名字
        displayName: 'Kingsoft AirScript',
        // 内部名字，给 n8n 自己看的
        name: 'kingsoftAirscript',
        // 图标文件的路径，'file:' 表示它和这个文件在同一个目录
        icon: 'file:kingsoftAirscript.svg',
        // 节点属于哪个分组
        group: ['transform'],
        // 版本号
        version: 1,
        // 节点下方的副标题，这里会动态显示用户选择的操作
        subtitle: '={{$parameter["operation"]}}',
        // 节点的详细描述
        description: '一个通用的金山 AirScript 执行器。访问 <a href="https://www.kdocs.cn/l/cho73TDGgMPP">官方指南 & 脚本库</a> 获取更多帮助',
        // 节点的默认名字
        defaults: {
            name: 'Kingsoft AirScript',
        },
        // 输入口，'main' 表示有一个主要的输入口
        inputs: ['main'],
        // 输出口，'main' 表示有一个主要的输出口
        outputs: ['main'],
        // 告诉 n8n，这个节点需要使用我们上面定义的那个凭证
        credentials: [
            {
                name: 'kingsoftAirscriptApi', // 这个名字必须和凭证文件里的 'name' 一致
                required: true, // 表示必须选择凭证才能运行
            },
        ],
        // 'properties' 定义了节点界面上有哪些输入框和选项
        properties: [
            // 第一个属性：操作类型下拉框
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
            // --- 新增：“二选一”的输入模式选择框 ---
            {
                displayName: 'ID 输入模式',
                name: 'idInputMode',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        operation: ['runScriptSync', 'runScriptAsync'],
                    },
                },
                options: [
                    {
                        name: '通过 Webhook 链接输入',
                        value: 'url',
                        description: '粘贴完整的链接，最简单快捷',
                    },
                    {
                        name: '手动输入 ID',
                        value: 'manual',
                        description: '分别填写 File ID 和 Script ID',
                    },
                ],
                default: 'url',
            },

            // --- 模式一：Webhook 链接输入 ---
            {
                displayName: 'Webhook 链接',
                name: 'webhookUrl',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['runScriptSync', 'runScriptAsync'],
                        idInputMode: ['url'], // 只在选择 'url' 模式时显示
                    },
                },
                placeholder: '在此粘贴从金山文档复制的完整链接',
                description: '推荐！最简单的方式。',
            },

            // --- 模式二：手动输入 ID ---
            {
                displayName: '文件 ID (File ID)',
                name: 'fileId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['runScriptSync', 'runScriptAsync'],
                        idInputMode: ['manual'], // 只在选择 'manual' 模式时显示
                    },
                },
                description: '脚本所在文档的 ID。',
            },
            {
                displayName: '脚本 ID (Script ID)',
                name: 'scriptId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['runScriptSync', 'runScriptAsync'],
                        idInputMode: ['manual'], // 只在选择 'manual' 模式时显示
                    },
                },
                description: '要执行的脚本的 ID。',
            },
            // --- 可选的 Context 参数被收纳到这里，让界面更清爽 ---
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
            // 第四个属性：参数输入框
            {
                displayName: '脚本参数 (Argv)',
                name: 'argv',
                type: 'json', // // 类型是 JSON，意味着可以传对象、数组等复杂结构
                default: '{\n  "message": "Hello from n8n!"\n}',
                required: true, // <-- 加上这一行
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
                // 使用 displayOptions，让这个输入框只在用户选择'获取任务状态'时显示
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

    // 'execute' 方法是节点的心脏，点击“执行”按钮时，就会运行这里的代码
    // 在 KingsoftAirscript.node.ts 文件里，用下面的代码完整替换掉旧的 execute 方法
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const credentials = await this.getCredentials('kingsoftAirscriptApi');
        const operation = this.getNodeParameter('operation', 0, '') as string;

        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;

                if (operation === 'runScriptSync' || operation === 'runScriptAsync') {
                    // --- 根据“输入模式”获取 ID ---
                    const idInputMode = this.getNodeParameter('idInputMode', i, 'url') as string;
                    let fileId = '';
                    let scriptId = '';

                    if (idInputMode === 'url') {
                        const webhookUrl = this.getNodeParameter('webhookUrl', i, '') as string;
                        const match = webhookUrl.match(/file\/(.*?)\/script\/(.*?)\//);
                        if (match && match[1] && match[2]) {
                            fileId = match[1];
                            scriptId = match[2];
                        } else {
                            throw new NodeOperationError(this.getNode(), 'Webhook 链接格式不正确，无法解析出 ID。');
                        }
                    } else { // idInputMode === 'manual'
                        fileId = this.getNodeParameter('fileId', i, '') as string;
                        scriptId = this.getNodeParameter('scriptId', i, '') as string;
                    }
                    
                    // 由于界面上已经做了必填校验，这里的二次校验可以简化
                    if (!fileId || !scriptId) {
                         throw new NodeOperationError(this.getNode(), '未能获取到有效的 File ID 和 Script ID。');
                    }
                    // --- ID 获取逻辑结束 ---
                    // --- 构建 Context 对象的逻辑 ---
                    const argvString = this.getNodeParameter('argv', i, '{}') as string;
                    const contextParameters = this.getNodeParameter('contextParameters', i, {}) as { [key: string]: string };                    
                    const argv = JSON.parse(argvString);
                    const context: IDataObject = { argv };

                    if (contextParameters.sheetName) context.sheet_name = contextParameters.sheetName;
                    if (contextParameters.range) context.range = contextParameters.range;
                    if (contextParameters.linkFrom) context.link_from = contextParameters.linkFrom;
                    if (contextParameters.dbActiveView) context.db_active_view = contextParameters.dbActiveView;
                    if (contextParameters.dbSelection) context.db_selection = contextParameters.dbSelection;

                    const body = { Context: context };
                    
                    const url = operation === 'runScriptSync'
                        ? `https://www.kdocs.cn/api/v3/ide/file/${fileId}/script/${scriptId}/sync_task`
                        : `https://www.kdocs.cn/api/v3/ide/file/${fileId}/script/${scriptId}/task`;

                    responseData = await this.helpers.httpRequest({
                        method: 'POST',
                        url: url,
                        headers: {
                            'Content-Type': 'application/json',
                            'AirScript-Token': credentials.apiToken as string,
                        },
                        body: body,
                        json: true,
                    });
                } else if (operation === 'getTaskStatus') {
                    const taskId = this.getNodeParameter('taskId', i, '') as string;
                    const url = `https://www.kdocs.cn/api/v3/script/task`;
                    const options = {
                        method: 'GET' as const,
                        url: url,
                        headers: { 'Content-Type': 'application/json' },
                        qs: { task_id: taskId },
                        json: true,
                    } as const;
                    responseData = await this.helpers.httpRequest(options);
                }

                if (responseData) {
                    returnData.push({ json: responseData, pairedItem: { item: i } });
                }

            } catch (error) {
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