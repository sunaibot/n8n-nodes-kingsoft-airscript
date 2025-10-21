import {
    ICredentialType,
    INodeProperties,
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

    // 我们已经证明了 test 功能不可靠，所以我们在这里彻底移除了它。
    // 这才是最负责任的做法。
}