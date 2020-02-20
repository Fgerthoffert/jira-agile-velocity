import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as loadJsonFile from 'load-json-file';
import { getWeek, getYear } from 'date-fns';

import { ConfigService } from '../config.service';

export const getTeamId = (teamName: string) => {
	return String(teamName)
		.replace('team-', '') // If team is prefixed by team-, we simply remove it from the string
		.replace(/[^a-z0-9+]+/gi, '')
		.toLowerCase();
};

const addDays = (date: string, days: number) => {
	const newDate = new Date(date);
	newDate.setDate(newDate.getDate() + days);
	return newDate;
};

@Injectable()
export class HistoryService {
	private readonly logger = new Logger(HistoryService.name);
	configBasePath: string;

	constructor(config: ConfigService) {
		this.configBasePath = config.get('CONFIG_DIR');
	}

	async getHistory(initiativeKey: string): Promise<any> {
		// Get list of initiatives files
		const cacheDir = this.configBasePath + '/cache/';

		// Get initiatives files
		const historyFiles = fs
			.readdirSync(cacheDir)
			.filter((file: string) => file.includes('initiatives-artifacts-')) // Look for all .clear files
			.filter((file: string) => !file.includes('raw'));
		const historyData = historyFiles.map((file: string) => {
			const initiativesData: any = loadJsonFile.sync(cacheDir + file);
			const currentDate = new Date(initiativesData.updatedAt);
			if (currentDate.getDay() === 0) {
				const initiative = initiativesData.initiatives.find((i) => i.key === initiativeKey);
				console.log(initiative);
				const currentWeekTxt = getYear(currentDate) + '.' + getWeek(currentDate);
				const teamId = getTeamId(initiative.assignee.name);
				const teamVelocityData: any = loadJsonFile.sync(cacheDir + 'velocity-artifacts-' + teamId + '.json');
				const teamWeeksData = teamVelocityData.weeks.find((week: any) => week.weekTxt === currentWeekTxt);
				console.log(teamWeeksData);
				const etaWeeks = {
					issues:
						Math.round(
							initiative.metrics.issues.completed / teamWeeksData.completion.issues.velocity * 100
						) / 100,
					points:
						Math.round(
							initiative.metrics.points.completed / teamWeeksData.completion.points.velocity * 100
						) / 100
				};
				return {
					date: initiativesData.updatedAt,
					key: initiative.key,
					overall: initiative.metrics,
					completed: {
						initiative: {},
						team: {
							issues: { count: teamWeeksData.completion.issues.count },
							points: { count: teamWeeksData.completion.points.count }
						}
					},
					eta: {
						weeks: etaWeeks,
						date: {
							issues: addDays(initiativesData.updatedAt, etaWeeks.issues * 7),
							points: addDays(initiativesData.updatedAt, etaWeeks.points * 7)
						}
					}
				};
			}
			return null;
		});
		return historyData.filter((d) => d !== null);
	}
}
