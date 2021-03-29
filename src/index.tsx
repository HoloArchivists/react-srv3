import * as React from 'react';
import { parseSrv3XML } from './util/parse-srv3';

interface CaptionsRenderrerProps {
  srv3: string;
  currentTime: number;
}

export const CaptionsRenderrer = ({
  srv3,
  currentTime,
}: CaptionsRenderrerProps) => {
  React.useEffect(() => {
    parseSrv3XML(srv3);
  }, [srv3]);

  return (
    <div style={{ width: '100%', height: '100%', color: '#fff' }}>
      {currentTime}
    </div>
  );
};
