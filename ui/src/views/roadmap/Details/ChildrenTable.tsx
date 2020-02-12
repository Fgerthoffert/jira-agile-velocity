import MaterialTable from 'material-table';
import React, { FC } from 'react';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import IconButton from '@material-ui/core/IconButton';
import ProgressBar from 'react-bootstrap/ProgressBar';

import { getProgress, getBarVariant, getEstimateState } from '../utils';

const InitiativeTable: FC<any> = ({ children, jiraHost, setGraphInitiative, updateGraph, setOpenGraph }) => {
	const dedaultStyle = { padding: '4px 5px 4px 5px' };
	return (
		<MaterialTable
			columns={[
				{
					title: '',
					field: 'url',
					render: (rowData) => {
						return (
							<IconButton
								aria-label='open-external'
								size='small'
								href={rowData.url}
								rel='noopener noreferrer'
								target='_blank'
							>
								<OpenInNewIcon fontSize='small' />
							</IconButton>
						);
					},
					headerStyle: { ...dedaultStyle, width: 20 },
					cellStyle: { ...dedaultStyle, padding: '4px 0px 4px 0px', width: 20 }
				},
				{
					title: 'Key',
					field: 'key',
					cellStyle: { ...dedaultStyle, width: 160 }
				},
				{
					title: 'Title',
					field: 'title',
					cellStyle: { ...dedaultStyle }
				},
				{
					title: 'Team',
					field: 'team',
					cellStyle: { ...dedaultStyle, width: 200 }
				},
				{
					title: 'Points',
					field: 'progressPoints',
					headerStyle: { ...dedaultStyle, width: 160 },
					cellStyle: { ...dedaultStyle, width: 160 },
					render: (rowData) => {
						return (
							<ProgressBar
								variant={getBarVariant(rowData.progressPoints.progress, 0)}
								now={rowData.progressPoints.progress}
								label={
									<span style={{ color: '#000' }}>
										{rowData.progressPoints.progress}% (
										{rowData.progressPoints.completed}/
										{rowData.progressPoints.total})
									</span>
								}
							/>
						);
					}
				},
				{
					title: 'Estimated',
					field: 'progressEstimate',
					headerStyle: { ...dedaultStyle, width: 120 },
					cellStyle: { ...dedaultStyle, width: 120 },
					render: (rowData) => {
						return (
							<span style={{ color: '#000' }}>
								{rowData.progressEstimate.progress}% (
								{rowData.progressEstimate.esimtated}/
								{rowData.progressEstimate.total})
							</span>
						);
					}
				},
				{
					title: 'Issues Count',
					field: 'progressIssues',
					headerStyle: { ...dedaultStyle, width: 160 },
					cellStyle: { ...dedaultStyle, width: 160 },
					render: (rowData) => {
						return (
							<ProgressBar
								variant={getBarVariant(rowData.progressIssues.progress, 0)}
								now={rowData.progressIssues.progress}
								label={
									<span style={{ color: '#000' }}>
										{rowData.progressIssues.progress}% (
										{rowData.progressIssues.completed}/
										{rowData.progressIssues.total})
									</span>
								}
							/>
						);
					}
				},
				{
					title: 'State',
					field: 'state',
					cellStyle: { ...dedaultStyle, width: 80 }
				}
			]}
			data={children.map((child: any) => {
				return {
					key: child.key,
					title: child.summary,
					url: jiraHost + '/browse/' + child.key,
					team: child.assignee === null ? 'n/a' : child.assignee.name,
					state: child.status.name,
					progressPoints: getProgress(child, 'points'),
					progressIssues: getProgress(child, 'issues'),
					progressEstimate: getEstimateState(child)
				};
			})}
			title={''}
			options={{
				pageSize: 50,
				pageSizeOptions: [ 10, 20, 50, 100 ],
				emptyRowsWhenPaging: false,
				search: false,
				toolbar: false
			}}
		/>
	);
};

export default InitiativeTable;
