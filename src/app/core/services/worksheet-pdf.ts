import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PDFDocument, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

@Injectable({
  providedIn: 'root',
})
export class WorksheetPdfService {
  private translate = inject(TranslateService);

  private readonly fontSrc = './fonts/curve_dashed.ttf';
  private readonly pageWidth = 612;
  private readonly pageHeight = 792;

  public async generate(lines: string[]): Promise<Uint8Array> {
    const doc: PDFDocument = await PDFDocument.create();

    doc.registerFontkit(fontkit);

    const [page, customFont, helveticaFont] = await Promise.all([
      doc.addPage([this.pageWidth, this.pageHeight]),
      this.fetchFont().then((fontBytes) => doc.embedFont(fontBytes)),
      doc.embedFont(StandardFonts.Helvetica),
    ]);

    const headerText = this.translate.instant('worksheet.pdfTitle');
    const headerFontSize = 12;
    const textWidth = helveticaFont.widthOfTextAtSize(
      headerText,
      headerFontSize,
    );
    const centerX = (this.pageWidth - textWidth) / 2;

    page.drawText(headerText, {
      x: centerX,
      y: 740,
      size: headerFontSize,
      font: helveticaFont,
    });

    const startY = 680;
    const lineSetSpacing = 48;
    let currentY = startY;

    for (const text of lines) {
      const lineSpacing = this.drawTripleLines(page, currentY);

      if (text) {
        page.drawText(text, {
          x: 72,
          y: currentY - lineSpacing - 1,
          size: 55,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }

      currentY -= lineSetSpacing;
      this.drawTripleLines(page, currentY);
      currentY -= lineSetSpacing;
    }

    const footerText = this.translate.instant('worksheet.pdfFooter');
    const footerFontSize = 10;
    const footerTextWidth = helveticaFont.widthOfTextAtSize(
      footerText,
      footerFontSize,
    );
    const footerCenterX = (this.pageWidth - footerTextWidth) / 2;

    page.drawText(footerText, {
      x: footerCenterX,
      y: 36,
      size: footerFontSize,
      font: helveticaFont,
    });

    return doc.save();
  }

  private async fetchFont(): Promise<ArrayBuffer> {
    const response = await fetch(this.fontSrc);
    if (!response.ok) throw new Error('Font fetch failed');
    return response.arrayBuffer();
  }

  private drawTripleLines(page: PDFPage, yPosition: number): number {
    const lineSpacing = 32;
    const lineWidth = 468;

    page.drawLine({
      start: { x: 72, y: yPosition },
      end: { x: 72 + lineWidth, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    const dashLength = 5;
    const gapLength = 5;
    let x = 72;

    while (x < 72 + lineWidth) {
      const endX = Math.min(x + dashLength, 72 + lineWidth);
      page.drawLine({
        start: { x, y: yPosition - lineSpacing / 2 },
        end: { x: endX, y: yPosition - lineSpacing / 2 },
        thickness: 0.5,
        color: rgb(0.5, 0.5, 0.5),
      });
      x += dashLength + gapLength;
    }

    page.drawLine({
      start: { x: 72, y: yPosition - lineSpacing },
      end: { x: 72 + lineWidth, y: yPosition - lineSpacing },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    return lineSpacing;
  }
}
