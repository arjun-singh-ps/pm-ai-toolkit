// Ambient declaration for pdf-parse. Under moduleResolution:"bundler" TypeScript
// resolves to the ESM build which doesn't declare a default export. This shim
// restores the expected interface so API routes can import pdfParse normally.

declare module "pdf-parse" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: Record<string, unknown>
  ): Promise<PdfParseResult>;

  export = pdfParse;
}
