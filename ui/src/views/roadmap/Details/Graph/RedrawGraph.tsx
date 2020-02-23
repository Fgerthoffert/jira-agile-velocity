import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { FC } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import RefreshIcon from '@material-ui/icons/Refresh';

import { connect } from 'react-redux';

import { iRootState } from '../../../../store';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		button: {
			margin: theme.spacing(1)
		},
		leftIcon: {
			marginRight: theme.spacing(1)
		},
		iconSmall: {
			fontSize: 20
		}
	})
);

const mapState = (state: iRootState) => ({
	graphNode: state.roadmap.graphNode,
	graphInitiative: state.roadmap.graphInitiative
});

const mapDispatch = (dispatch: any) => ({
	setOpenGraph: dispatch.roadmap.setOpenGraph
});

type connectedProps = ReturnType<typeof mapState> & ReturnType<typeof mapDispatch>;

const RedrawGraph: FC<connectedProps> = ({ graphNode }) => {
	const classes = useStyles();

	const redrawView = () => {
		const layout = graphNode.layout({
			name: 'cose-bilkent',
			animate: 'end',
			animationEasing: 'ease-out',
			animationDuration: 1000,
			randomize: true
		});
		layout.run();
	};

	return (
		<Button variant='contained' size='small' color='primary' className={classes.button} onClick={redrawView}>
			<RefreshIcon className={clsx(classes.leftIcon, classes.iconSmall)} />
			Redraw
		</Button>
	);
};

export default connect(mapState, mapDispatch)(RedrawGraph);
