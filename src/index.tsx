import * as React from 'react';
import { parseSrv3XML, findActive, toRGBA } from './util/srv3';
import { ParsedCaptions, CaptionEvent } from './captions.interface';
import { fontMap } from './constants';

export type CaptionsRenderrerProps = {
  srv3: string;
  currentTime: number;
};

export const CaptionsRenderrer = ({
  srv3,
  currentTime,
}: CaptionsRenderrerProps) => {
  const [
    parsedCaptions,
    setParsedCaptions,
  ] = React.useState<ParsedCaptions | null>(null);
  const [activeEvents, setActiveEvents] = React.useState<CaptionEvent[]>([]);

  React.useEffect(() => {
    setParsedCaptions(parseSrv3XML(srv3));
  }, [srv3]);

  React.useEffect(() => {
    if (!parsedCaptions) return;
    const active = findActive(parsedCaptions, currentTime * 1000);
    setActiveEvents(active);
  }, [currentTime]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        color: '#fff',
        position: 'relative',
      }}
    >
      {activeEvents.map((event) => {
        if (!parsedCaptions) return;
        const windowStyle: React.CSSProperties = {
          position: 'absolute',
        };
        const wPos = parsedCaptions.windowPositions[event.windowPositionId];
        // const wStyle = parsedCaptions.windowStyles[event.windowStyleId]

        // Alignment
        windowStyle.left = wPos.alignHorizontal + '%';
        windowStyle.top = wPos.alignVertical + '%';

        // Anchor point
        let translateX = '0';
        let translateY = '0';
        if (['0', '1', '2'].includes(wPos.anchorPoint)) translateY = '0';
        else if (['3', '4', '5'].includes(wPos.anchorPoint))
          translateY = '-50%';
        else translateY = '-100%';
        if (['0', '3', '6'].includes(wPos.anchorPoint)) translateX = '0';
        else if (['1', '4', '7'].includes(wPos.anchorPoint))
          translateX = '-50%';
        else translateX = '-100%';
        windowStyle.transform = `translate(${translateX}, ${translateY})`;

        return (
          <div
            data-caption-window
            style={windowStyle}
            key={JSON.stringify(event)}
          >
            {event.segments.map((seg) => {
              const segmentStyle: React.CSSProperties = {};
              const pen = parsedCaptions.pens[seg.penId || 1];
              if (pen.bold) segmentStyle.fontWeight = 'bold';
              if (pen.italic) segmentStyle.fontStyle = 'italic';
              if (pen.underline) segmentStyle.textDecoration = 'underline';
              segmentStyle.fontFamily = fontMap[pen.fontStyle];
              segmentStyle.fontSize = pen.fontSize / 100 + 'em';
              segmentStyle.color = toRGBA(pen.fontColor, pen.fontOpacity);
              segmentStyle.backgroundColor = toRGBA(
                pen.backColor,
                pen.backOpacity
              );

              return <span style={segmentStyle}>{seg.text}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};
