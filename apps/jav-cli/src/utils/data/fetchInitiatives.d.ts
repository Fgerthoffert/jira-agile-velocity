import { IConfig } from '../../global';
declare const fetchInitiatives: (userConfig: IConfig, cacheDir: string, useCache: boolean) => Promise<any>;
export default fetchInitiatives;
