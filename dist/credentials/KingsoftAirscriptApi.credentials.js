"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KingsoftAirscriptApi = void 0;
class KingsoftAirscriptApi {
    constructor() {
        this.name = 'kingsoftAirscriptApi';
        this.displayName = '金山 AirScript API';
        this.icon = 'file:kingsoftAirscript.svg';
        this.documentationUrl = 'https://www.kdocs.cn/l/cho73TDGgMPP';
        this.properties = [
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
    }
}
exports.KingsoftAirscriptApi = KingsoftAirscriptApi;
//# sourceMappingURL=KingsoftAirscriptApi.credentials.js.map