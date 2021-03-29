# react-srv3

> React component to render YouTube SRV3 closed captions

[![NPM](https://img.shields.io/npm/v/react-srv3.svg)](https://www.npmjs.com/package/react-srv3)

[View demo](https://react-srv3.vercel.app/)

## Install

```bash
yarn add react-srv3
```

## Usage

```tsx
import { CaptionsRenderer } from 'react-srv3';

<CaptionsRenderer
  srv3="<?xml ..." // SRV3 XML string
  currentTime={0}  // Current video time in seconds
/>
```

### Example

```tsx
import React from 'react';
import { CaptionsRenderer } from 'react-srv3';

const VideoPlayer = () => {
  const [currentTime, setCurrentTime] = React.useState(0);
  const [captionsText, setCaptionsText] = React.useState('');

  React.useEffect(() => {
    fetch('<srv3 captions file>')
      .then(res => res.text())
      .then(setCaptionsText)
  }, []);

  return (
    <div style={{ position: 'relative', width: 640, height: 360 }}>
      <video
        src="video.mp4"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
      />
      <CaptionsRenderer srv3={captionsText} currentTime={currentTime} />
    </div>
  )
}
```

## License

MIT © [hizkifw](https://github.com/hizkifw)
