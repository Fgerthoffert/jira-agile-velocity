// tslint:disable-next-line: file-name-casing
/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear } from 'date-fns';

import { ICalendar } from '../../global';
import { formatDate } from '../misc/dateUtils';

const initCalendar = (fromDate: string, toDate?: string | undefined) => {
	const initObject: ICalendar = {
		days: {},
		weeks: {},
		open: {},
		forecast: {},
		health: {}
	};
	const days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
	const emptyCompletion = {
		issues: { count: 0, velocity: 0 },
		points: { count: 0, velocity: 0 },
		list: []
	};
	let toDay = new Date();
	toDay.setDate(toDay.getDate() - 1); // We don't process current day, only fetching closed issues on past days
	if (toDate !== undefined) {
		toDay = new Date(toDate);
	}
	const currentDate = formatDate(fromDate);
	while (currentDate < toDay) {
		currentDate.setDate(currentDate.getDate() + 1);
		initObject.days[currentDate.toJSON().slice(0, 10)] = {
			date: currentDate.toJSON(),
			weekDay: currentDate.getDay(),
			weekDayJira: currentDate.toJSON().slice(0, 10),
			weekDayTxt: days[currentDate.getDay()],
			weekNb: getWeek(currentDate),
			weekTxt: getYear(currentDate) + '.' + getWeek(currentDate),
			completion: { ...emptyCompletion },
			scopeChangeCompletion: { ...emptyCompletion }
		};
		let currentMonthDay = currentDate.getDate();
		if (currentDate.getDay() !== 0) {
			currentMonthDay = currentMonthDay - currentDate.getDay();
		}
		const currentWeekYear = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentMonthDay);

		// tslint:disable-next-line: strict-type-predicates
		if (initObject.weeks[currentWeekYear.toJSON().slice(0, 10)] === undefined) {
			initObject.weeks[currentWeekYear.toJSON().slice(0, 10)] = {
				weekStart: currentWeekYear.toJSON(),
				date: currentWeekYear.toJSON(),
				weekNb: getWeek(currentWeekYear),
				weekTxt: getYear(currentWeekYear) + '.' + getWeek(currentWeekYear),
				weekJira: currentWeekYear.toJSON().slice(0, 10),
				completion: { ...emptyCompletion },
				scopeChangeCompletion: { ...emptyCompletion }
			};
		}
	}
	return initObject;
};

export default initCalendar;
