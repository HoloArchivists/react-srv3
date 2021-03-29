import React from 'react';

import { CaptionsRenderrer } from 'react-srv3';
import YoutubePlayer from './YoutubePlayer';

const App = () => {
  const videoId = 'S8dmq5YIUoc';

  const [currentTime, setCurrentTime] = React.useState(0);
  const [captionsText, setCaptionsText] = React.useState('');

  const updateTime = (time: number) => {
    setCurrentTime(time);
    console.log({ time });
  };

  const fetchCaptions = () => {
    fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`)
      .then((res) => res.text())
      .then(setCaptionsText);
  };

  React.useEffect(() => {
    fetchCaptions();
  }, [videoId]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>
        <YoutubePlayer videoId={videoId} onTimeChange={updateTime} />
        <div
          style={{
            width: 640,
            height: 360,
            background: 'black',
          }}
        >
          <CaptionsRenderrer srv3={captionsText} currentTime={currentTime} />
        </div>
      </div>
    </div>
  );
};

export default App;
