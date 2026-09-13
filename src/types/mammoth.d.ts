declare module 'mammoth' {
  interface ConvertOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: any;
    path?: string;
  }
  interface ConvertResult {
    value: string;
    messages: any[];
  }
  export function convertToHtml(input: ConvertOptions, options?: any): Promise<ConvertResult>;
  export function extractRawText(input: ConvertOptions): Promise<ConvertResult>;
  const mammoth: {
    convertToHtml: typeof convertToHtml;
    extractRawText: typeof extractRawText;
  };
  export default mammoth;
}

declare module 'mammoth/mammoth.browser' {
  import mammoth from 'mammoth';
  export = mammoth;
}

declare module 'docx-preview' {
  export function renderAsync(
    data: Blob | ArrayBuffer | Uint8Array,
    bodyContainer: HTMLElement,
    styleContainer?: HTMLElement,
    options?: any
  ): Promise<any>;
  export const defaultOptions: any;
}
