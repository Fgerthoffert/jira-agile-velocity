import { IConfig, IJiraIssue } from '../../global';
declare const fetchCompleted: (config: IConfig, cacheDir: string, teamName: string) => Promise<IJiraIssue[]>;
export default fetchCompleted;
