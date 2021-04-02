import React from 'react';

import { CaptionsRenderer } from 'react-srv3';
import YoutubePlayer from './YoutubePlayer';

const App = () => {
  // const videoId = 'S8dmq5YIUoc';
  // const videoId = 'yLrstz80MKs';
  const [videoURL, setVideoURL] = React.useState(
    'https://youtube.com/watch?v=cJgSlCbfuC8'
  );
  const [videoId, setVideoId] = React.useState('cJgSlCbfuC8');
  // const videoId = 'eB90el6Zb_k';

  const [currentTime, setCurrentTime] = React.useState(0);
  const [captionsText, setCaptionsText] = React.useState('');

  const updateTime = (time: number) => {
    setCurrentTime(time);
  };

  const fetchCaptions = () => {
    fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`)
      .then((res) => res.text())
      .then(setCaptionsText);
  };

  React.useEffect(() => {
    const url = new URL(videoURL);
    if (
      ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)
    )
      setVideoId(url.searchParams.get('v') || '');
    if (url.hostname === 'youtu.be') setVideoId(url.pathname.substr(1));
  }, [videoURL]);

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
        <input
          type='text'
          value={videoURL}
          onChange={(e) => setVideoURL(e.target.value)}
          style={{
            width: '100%',
          }}
        />
        <br />
        <YoutubePlayer videoId={videoId} onTimeChange={updateTime} />
        <div
          style={{
            width: 640,
            height: 360,
            backgroundImage: `url("https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp")`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <CaptionsRenderer srv3={captionsText} currentTime={currentTime} />
        </div>
      </div>
    </div>
  );
};

export default App;
