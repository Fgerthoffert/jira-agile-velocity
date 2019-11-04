import { IConfig } from '../../global';
declare const fetchChildren: (userConfig: IConfig, issueKey: string, cacheDir: string, useCache: boolean) => Promise<any>;
export default fetchChildren;
