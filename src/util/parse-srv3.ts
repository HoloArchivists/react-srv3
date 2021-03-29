import fxp from 'fast-xml-parser';
import { ParsedCaptions, CaptionSegment } from '../captions.interface';

/**
 * Referenced from
 * https://medium.com/@js_jrod/the-first-complete-guide-to-youtube-captions-f886e06f7d9d
 */

export const parseSrv3XML = (xmlString: string) => {
  console.log('Parsing XML');
  const xml = fxp.parse(xmlString, {
    attributeNamePrefix: '@_',
    ignoreAttributes: false,
  });
  const cc: ParsedCaptions = {
    pens: [],
    windowStyles: [],
    windowPositions: [],
    events: [],
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
      fontSize: Number(pen['@_sz'] || 1),
      fontColor: pen['@_fc'],
      backColor: pen['@_bc'],
      edgeColor: pen['@_ec'],
      fontOpacity: Number(pen['@_fo'] || 0),
      backOpacity: Number(pen['@_bo'] || 1),
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
      anchorPoint: wp['@_ap'],
      columnCount: wp['@_cc'],
      rowCount: wp['@_rc'],
      alignHorizontal: wp['@_ah'],
      alignVertical: wp['@_av'],
    };
  }

  /**
   * Parse body
   */

  for (const event of xml.timedtext.body.p) {
    let segments: CaptionSegment[] = [];
    if ('#text' in event)
      segments.push({ text: event['#text'], penId: event['@_p'] });
    else
      segments = event.s.map((s: any) => ({
        text: s['#text'],
        penId: s['@_p'],
      }));

    cc.events.push({
      startTime: Number(event['@_t'] || 0),
      duration: Number(event['@_d'] || 0),
      windowStyleId: Number(event['@_ws'] || 1),
      windowPositionId: Number(event['@_wp'] || 1),
      segments,
    });
  }

  console.log(cc);
  return cc;
};
