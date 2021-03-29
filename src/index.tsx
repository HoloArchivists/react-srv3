import * as React from 'react';

interface CaptionsRenderrerProps {
  srv3: string;
  currentTime: number;
}

export const CaptionsRenderrer = ({
  srv3,
  currentTime,
}: CaptionsRenderrerProps) => {
  console.log(srv3);
  return (
    <div style={{ width: '100%', height: '100%', color: '#fff' }}>
      {currentTime}
    </div>
  );
};
