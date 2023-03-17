import React, { FC } from 'react';

import Roadmap from './roadmap';

interface Props {
  streamId: string;
}

const Streams: FC<Props> = ({ streamId }) => {
  return <Roadmap streamId={streamId} />;
};

export default Streams;
