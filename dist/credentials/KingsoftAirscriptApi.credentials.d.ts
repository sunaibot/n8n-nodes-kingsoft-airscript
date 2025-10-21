import { ICredentialType, INodeProperties, ICredentialTestRequest, Icon } from 'n8n-workflow';
export declare class KingsoftAirscriptApi implements ICredentialType {
    name: string;
    displayName: string;
    icon: Icon;
    documentationUrl: string;
    properties: INodeProperties[];
    test: ICredentialTestRequest;
}
