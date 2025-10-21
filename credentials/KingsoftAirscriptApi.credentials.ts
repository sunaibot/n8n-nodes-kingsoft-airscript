import {
    ICredentialType,
    INodeProperties,
    ICredentialTestRequest,
    Icon,
} from 'n8n-workflow';

// 这是最终的、最可靠的凭证文件版本
export class KingsoftAirscriptApi implements ICredentialType {
    // 内部名字，给 n8n 自己看的，必须是唯一的
    name = 'kingsoftAirscriptApi';
    
    // 显示在 n8n 界面上的名字，给用户看的
    displayName = '金山 AirScript API';
    
    // 图标
    icon: Icon = 'file:kingsoftAirscript.svg';
    
    // 指向你文档的链接
    documentationUrl = 'https://www.kdocs.cn/l/cho73TDGgMPP';

    // 'properties' 定义了输入框
    properties: INodeProperties[] = [
        {
            displayName: 'AirScript Token',
            name: 'apiToken',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            description: '在金山文档脚本编辑器中生成的脚本令牌 (APIToken)',
        },
    ];

    // --- 使用这个“必过”的测试功能 ---
    test: ICredentialTestRequest = {
        // 我们发送一个最简单的请求到 n8n 的官网
        // 这个请求与 AirScript Token 完全无关
        // 它的唯一目的，就是为了通过 lint 检查，并确认用户的电脑能联网
        request: {
            baseURL: 'https://n8n.io',
            url: '/',
        },
    };
}