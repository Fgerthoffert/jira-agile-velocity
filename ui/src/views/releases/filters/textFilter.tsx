import React, { FC, useState } from 'react';

import TextField from '@mui/material/TextField';

interface Props {
  filterId: string;
  filterLabel: string;
  value: string;
  setValue: (value: string) => void;
}

const TextFilter: FC<Props> = ({ filterId, filterLabel, value, setValue }) => {
  const sourceValue = !value ? '' : value;

  const [filterValue, setFilterValue] = useState(sourceValue);
  React.useEffect(() => {
    setFilterValue(sourceValue);
  }, [sourceValue]);

  return (
    <TextField
      id={filterId}
      size="small"
      label={filterLabel}
      variant="outlined"
      value={filterValue}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterValue(event.target.value);
        setTimeout(() => {
          setValue(event.target.value);
        }, 2000);
      }}
    />
  );
};

export default TextFilter;
