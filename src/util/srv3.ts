import fxp from 'fast-xml-parser';
import {
  ParsedCaptions,
  CaptionSegment,
  CaptionEvent,
} from '../captions.interface';

/**
 * Referenced from
 * https://medium.com/@js_jrod/the-first-complete-guide-to-youtube-captions-f886e06f7d9d
 */

export const parseSrv3XML = (xmlString: string) => {
  console.log('Parsing XML');
  const xml = fxp.parse(xmlString, {
    attributeNamePrefix: '@_',
    ignoreAttributes: false,
    trimValues: false,
  });
  const cc: ParsedCaptions = {
    pens: [],
    windowStyles: [],
    windowPositions: [],
    events: [],
    eventMeta: {
      maxDuration: 0,
    },
  };

  /**
   * Parse head
   */
  if (!xml.timedtext || !xml.timedtext.head) return null;
  for (const pen of xml.timedtext.head.pen) {
    cc.pens[pen['@_id']] = {
      bold: pen['@_b'] === '1',
      italic: pen['@_i'] === '1',
      underline: pen['@_u'] === '1',
      fontStyle: Number(pen['@_fs'] || 0),
      fontSize: Number(pen['@_sz'] || 100),
      fontColor: pen['@_fc'] || '#ffffff',
      backColor: pen['@_bc'] || '#000000',
      edgeColor: pen['@_ec'] || '#000000',
      fontOpacity: Number(pen['@_fo'] || 1),
      backOpacity: Number(pen['@_bo'] || 0.75),
      edgeType: Number(pen['@_et'] || 0),
      offset: Number(pen['@_of'] || 0),
      ruby: pen['@_rb'],
      horizontalGuide: pen['@_hg'] === '1',
      textEmphasis: pen['@_te'],
    };
  }

  for (const ws of xml.timedtext.head.ws) {
    cc.windowStyles[ws['@_id']] = {
      justify:
        ws['@_ju'] === '0'
          ? 'start'
          : ws['@_ju'] === '1'
          ? 'end'
          : ws['@_ju'] === '2'
          ? 'center'
          : ws['@_ju'] === '3'
          ? 'justify'
          : 'center',
      printDirection:
        ws['@_pd'] === '0' ? 'ltr' : ws['@_pd'] === '1' ? 'rtl' : ws['@_pd'],
      scrollDirection:
        ws['@_sd'] === '0' ? 'ltr' : ws['@_sd'] === '1' ? 'rtl' : ws['@_sd'],
      modeHint: ws['@_mh'] === '2' ? 'scroll' : 'default',
      windowFillColor: ws['@_wfc'],
      windowFillOpacity: Number(ws['@_wfo'] || 0),
    };
  }

  for (const wp of xml.timedtext.head.wp) {
    cc.windowPositions[wp['@_id']] = {
      anchorPoint: wp['@_ap'] || '7',
      columnCount: wp['@_cc'],
      rowCount: wp['@_rc'],
      alignHorizontal: Number(wp['@_ah'] || 50),
      alignVertical: Number(wp['@_av'] || 100),
    };
  }

  /**
   * Parse body
   */

  for (const event of xml.timedtext.body.p) {
    let segments: CaptionSegment[] = [];
    if ('#text' in event)
      segments.push({
        text: event['#text'] || '',
        penId: Number(event['@_p'] || 1),
      });
    else
      segments = event.s.map((s: any) => ({
        text: s['#text'] || '',
        penId: Number(s['@_p'] || 1),
      }));

    cc.events.push({
      startTime: Number(event['@_t'] || 0),
      duration: Number(event['@_d'] || 0),
      windowStyleId: Number(event['@_ws'] || 1),
      windowPositionId: Number(event['@_wp'] || 1),
      segments,
    });
    cc.eventMeta.maxDuration = Math.max(
      cc.eventMeta.maxDuration,
      Number(event['@_d'] || 0)
    );
  }

  /**
   * Sort timestamps
   */
  cc.events.sort((a, b) => a.startTime - b.startTime);

  console.log(cc);
  return cc;
};

/**
 * bsearch - find the closest element in an array
 * using binary search
 *
 * @returns index of element in the array
 */
function bsearch<T>(
  arr: T[],
  search: number,
  transform: (item: T) => number
): number {
  let iL = 0,
    iR = arr.length - 1,
    iM = Math.floor(arr.length / 2);

  while (iR - iL > 1) {
    iM = Math.floor((iL + iR) / 2);
    const m = transform(arr[iM]);

    if (m < search) iL = iM;
    else if (m > search) iR = iM;
    else if (m === search || iL === iM) return iM;
  }
  return iM;
}

export const findActive = (captions: ParsedCaptions, timestampMs: number) => {
  // Find index of most recent caption event at current timestamp
  const idxLatest = bsearch(
    captions.events,
    timestampMs,
    (evt) => evt.startTime
  );
  const visibleEvents: CaptionEvent[] = [];

  // Look backwards for previously-active captions
  let i = idxLatest;
  while (
    i > 0 &&
    timestampMs - captions.events[i].startTime < captions.eventMeta.maxDuration
  ) {
    const event = captions.events[i];
    if (
      event.startTime <= timestampMs &&
      event.startTime + event.duration > timestampMs
    )
      visibleEvents.push(event);
    i--;
  }

  return visibleEvents;
};

export const toRGBA = (hex: string, opacity: number) => {
  const opHex = Math.round(255 * opacity)
    .toString(16)
    .padStart(2, '0');
  return hex + opHex;
};
