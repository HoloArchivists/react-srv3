export type Pen = Partial<{
  bold: boolean;
  italic: boolean;
  underline: boolean;

  fontStyle: number;
  fontSize: number;

  fontColor: string;
  backColor: string;
  edgeColor: string;
  fontOpacity: number;
  backOpacity: number;
  edgeType: number;

  offset: number;
  ruby: number;
  horizontalGuide: boolean;
  textEmphasis: string;
}>;

export type WindowStyle = Partial<{
  justify: 'start' | 'end' | 'center' | 'justify';
  printDirection: 'ltr' | 'rtl' | '2' | '3';
  scrollDirection: 'ltr' | 'rtl';
  modeHint: 'default' | 'scroll';
  windowFillColor: string;
  windowFillOpacity: number;
}>;

export type WindowPosition = Partial<{
  anchorPoint: string;
  columnCount: string;
  rowCount: string;
  alignHorizontal: string;
  alignVertical: string;
}>;

export type CaptionSegment = Partial<{
  text: string;
  penId: number;
}>;

export type CaptionEvent = Partial<{
  startTime: number;
  duration: number;
  windowPositionId: number;
  windowStyleId: number;
  segments: CaptionSegment[];
}>;

export type ParsedCaptions = {
  pens: Pen[];
  windowStyles: WindowStyle[];
  windowPositions: WindowPosition[];
  events: CaptionEvent[];
};
