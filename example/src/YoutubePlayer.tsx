import React from 'react';
import { useAnimationFrame } from './useAnimationFrame';

export type YoutubePlayerProps = {
  videoId: string;
  onTimeChange: (now: number) => any;
};

const YoutubePlayer = (props: YoutubePlayerProps) => {
  const { videoId, onTimeChange } = props;
  const player = React.useRef<any>(null);

  React.useEffect(() => {
    if (!(window as any).YT) {
      // If not, load the script asynchronously
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';

      // onYouTubeIframeAPIReady will load the video after the script is loaded
      (window as any).onYouTubeIframeAPIReady = loadVideo;

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      // If script is already there, load the video directly
      loadVideo();
    }
  }, []);

  useAnimationFrame(() => {
    try {
      const time = player.current.getCurrentTime();
      const state = player.current.getPlayerState();
      if (state === 1) onTimeChange(time);
    } catch (ex) {}
  });

  const loadVideo = () => {
    player.current = new (window as any).YT.Player('youtube-player', {
      videoId,
      events: {},
    });
  };

  return <div id='youtube-player' />;
};

export default YoutubePlayer;
