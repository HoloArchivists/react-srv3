import * as React from 'react';
import {
  parseSrv3XML,
  findActive,
  toRGBA,
  defaultWindowPosition,
  defaultWindowStyle,
  defaultPen,
} from './util/srv3';
import { ParsedCaptions, CaptionEvent } from './captions.interface';
import { fontMap } from './constants';

export type CaptionsRendererProps = {
  srv3: string;
  currentTime: number;
  classnamePrefix?: string;
};

export const CaptionsRenderer = ({
  srv3,
  currentTime,
  classnamePrefix,
}: CaptionsRendererProps) => {
  if (!classnamePrefix) classnamePrefix = 'react-srv3-';

  const refSelf = React.useRef<HTMLDivElement>(null);
  const [
    parsedCaptions,
    setParsedCaptions,
  ] = React.useState<ParsedCaptions | null>(null);
  const [activeEvents, setActiveEvents] = React.useState<CaptionEvent[]>([]);

  React.useEffect(() => {
    try {
      setParsedCaptions(parseSrv3XML(srv3));
    } catch (ex) {
      console.error(ex);
    }
  }, [srv3]);

  React.useEffect(() => {
    if (!parsedCaptions) return;
    const active = findActive(parsedCaptions, currentTime * 1000);
    setActiveEvents(active);
  }, [currentTime]);

  const videoHeight = refSelf.current?.getBoundingClientRect().height || 0;

  return (
    <div
      ref={refSelf}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '2%',
          right: '2%',
          top: '2%',
          bottom: '2%',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {activeEvents.map((event) => {
            if (!parsedCaptions) return;
            const windowStyle: React.CSSProperties = {
              position: 'absolute',
              whiteSpace: 'pre',
            };
            const wPos =
              parsedCaptions.windowPositions[event.windowPositionId] ||
              defaultWindowPosition;
            const wStyle =
              parsedCaptions.windowStyles[event.windowStyleId] ||
              defaultWindowStyle;

            // Position and anchor point
            let translateX = '0';
            let translateY = '0';
            if (['0', '1', '2'].includes(wPos.anchorPoint)) {
              windowStyle.top = wPos.alignVertical + '%';
            } else if (['3', '4', '5'].includes(wPos.anchorPoint)) {
              translateY = '50%';
              windowStyle.bottom = 100 - wPos.alignVertical + '%';
            } else {
              windowStyle.bottom = 100 - wPos.alignVertical + '%';
            }

            if (['0', '3', '6'].includes(wPos.anchorPoint)) {
              windowStyle.left = wPos.alignHorizontal + '%';
            } else if (['1', '4', '7'].includes(wPos.anchorPoint)) {
              translateX = '50%';
              windowStyle.right = 100 - wPos.alignHorizontal + '%';
            } else {
              windowStyle.right = 100 - wPos.alignHorizontal + '%';
            }
            windowStyle.transform = `translate(${translateX}, ${translateY})`;

            windowStyle.textAlign = wStyle.justify || 'center';
            windowStyle.background = toRGBA(
              wStyle.windowFillColor,
              wStyle.windowFillOpacity
            );

            return (
              <div
                className={classnamePrefix + 'caption-window'}
                style={windowStyle}
                data-wp={event.windowPositionId}
                data-ap={wPos.anchorPoint}
                data-cc={wPos.columnCount}
                data-rc={wPos.rowCount}
                data-ah={wPos.alignHorizontal}
                data-av={wPos.alignVertical}
              >
                {event.segments.map((seg, idx) => {
                  const segmentStyle: React.CSSProperties = {
                    whiteSpace: 'pre',
                  };

                  // Padding
                  if (idx === 0) segmentStyle.paddingLeft = '.25em';
                  if (idx === event.segments.length - 1)
                    segmentStyle.paddingRight = '.25em';
                  // seg.text = seg.text.replace(/\n/g, ' \n ');

                  const pen = parsedCaptions.pens[seg.penId || 1] || defaultPen;
                  if (pen.bold) segmentStyle.fontWeight = 'bold';
                  if (pen.italic) segmentStyle.fontStyle = 'italic';
                  if (pen.underline) segmentStyle.textDecoration = 'underline';

                  // Transform the font size
                  // After some testing, I found this linear equation that
                  // closely matches how YouTube scales captions.
                  const pixelFontSize =
                    0.04 * pen.fontSize + (1 / 30) * videoHeight;

                  segmentStyle.fontSize = pixelFontSize + 'px';
                  segmentStyle.fontFamily = fontMap[pen.fontStyle];
                  segmentStyle.color = toRGBA(pen.fontColor, pen.fontOpacity);
                  segmentStyle.backgroundColor = toRGBA(
                    pen.backColor,
                    pen.backOpacity
                  );

                  if (pen.edgeType === 1) {
                    // drop shadow
                    segmentStyle.textShadow = pen.edgeColor + ' 0 0 5px';
                  } else if (pen.edgeType === 2) {
                    // raised
                    segmentStyle.textShadow = Array(5)
                      .fill(pen.edgeColor + ' 0 0 1px')
                      .join(', ');
                  } else if (pen.edgeType === 3) {
                    // uniform
                    segmentStyle.textShadow = Array(5)
                      .fill(pen.edgeColor + ' 0 0 1px')
                      .join(', ');
                  } else if (pen.edgeType === 4) {
                    // not sure what this is but I found it in this video S8dmq5YIUoc
                    segmentStyle.textShadow = [1.5, 2, 2.5]
                      .map((px) => pen.edgeColor + ' 1px 1px ' + px + 'px')
                      .join(', ');
                  }

                  if (seg.timeOffset + event.startTime > currentTime * 1000)
                    segmentStyle.opacity = 0;

                  return (
                    <span
                      className={classnamePrefix + 'caption-segment'}
                      style={segmentStyle}
                    >
                      {seg.text.replace(/\n/g, ' \n ')}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
