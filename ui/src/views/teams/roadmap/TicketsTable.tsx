import React, { FC } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const TicketsTable: FC<any> = ({ issues, jiraHost }) => {
  return (
    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell style={{ width: 20 }}></TableCell>
          <TableCell style={{ width: 150 }}>Key</TableCell>
          <TableCell>Title</TableCell>
          <TableCell style={{ width: 250 }}>Assignee</TableCell>
          <TableCell style={{ width: 20 }}>Points</TableCell>
          <TableCell style={{ width: 130 }}>State</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {issues.map((i: any) => (
          <TableRow
            key={i.key}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              <IconButton
                aria-label="open-external"
                size="small"
                href={jiraHost + '/browse/' + i.key}
                rel="noopener noreferrer"
                target="_blank"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </TableCell>
            <TableCell>{i.key}</TableCell>
            <TableCell>{i.summary}</TableCell>
            <TableCell>
              {i.assignee === null ? 'n/a' : i.assignee.displayName}
            </TableCell>
            <TableCell>{i.points > 0 ? i.points : ''}</TableCell>
            <TableCell>{i.status.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TicketsTable;
