import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormArray,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PDFDocument, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Settings } from '../settings/settings';

@Component({
  selector: 'app-generator',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    Settings,
  ],
  templateUrl: './generator.html',
  styleUrl: './generator.css',
})
export class Generator implements OnInit, OnDestroy {
  private translate = inject(TranslateService);

  public worksheetForm = new FormGroup({
    lines: new FormArray(
      Array.from(
        { length: 6 },
        () => new FormControl<string>('', [Validators.maxLength(30)])
      )
    ),
  });
  public inputPlaceholder = signal<string>('');
  public isGenerating = signal<boolean>(false);
  public hasAnyInputValue = signal<boolean>(false);

  private subs = new Subscription();
  private fontSrc = './fonts/curve_dashed.ttf';
  private readonly PAGE_WIDTH = 612;
  private readonly PAGE_HEIGHT = 792;

  public get lines(): FormArray {
    return this.worksheetForm.get('lines') as FormArray;
  }

  constructor() {
    this.subs.add(
      this.worksheetForm.valueChanges.subscribe(() => {
        this.hasAnyInputValue.set(
          this.lines.controls.some(
            (ctrl) => !!ctrl.value && ctrl.value.trim().length > 0
          )
        );
      })
    );
  }

  ngOnInit(): void {
    this.subs.add(
      this.translate.get('worksheet.maxCharacters').subscribe((res: string) => {
        this.inputPlaceholder.set(res);
      })
    );

    this.subs.add(
      this.translate.onLangChange.subscribe(() => {
        this.translate
          .get('worksheet.maxCharacters')
          .subscribe((res: string) => {
            this.inputPlaceholder.set(res);
          });
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public generateWorksheet(): void {
    if (this.worksheetForm.invalid || !this.hasAnyInputValue()) {
      return;
    }
    this.isGenerating.set(true);

    this.generatePDF()
      .then((pdfBytes) => {
        if (!pdfBytes) throw new Error('No PDF generated');
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
        link.download = `cursive-worksheet-${dateStr}-${timeStr}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        alert(this.translate.instant('notification.warningGeneration'));
      })
      .finally(() => {
        this.isGenerating.set(false);
      });
  }

  private async fetchFont(): Promise<ArrayBuffer> {
    const response = await fetch(this.fontSrc);
    if (!response.ok) throw new Error('Font fetch failed');
    return response.arrayBuffer();
  }

  private async generatePDF(): Promise<Uint8Array | undefined> {
    try {
      const doc: PDFDocument = await PDFDocument.create();

      doc.registerFontkit(fontkit);

      const [page, customFont, helveticaFont] = await Promise.all([
        doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]),
        this.fetchFont().then((fontBytes) => doc.embedFont(fontBytes)),
        doc.embedFont(StandardFonts.Helvetica),
      ]);

      // Header
      const headerText = 'Cursive Worksheet Generator';
      const headerFontSize = 12;
      const textWidth = helveticaFont.widthOfTextAtSize(
        headerText,
        headerFontSize
      );
      const centerX = (this.PAGE_WIDTH - textWidth) / 2;

      page.drawText(headerText, {
        x: centerX,
        y: 740,
        size: headerFontSize,
        font: helveticaFont,
      });

      const startY = 680;
      const lineSetSpacing = 48;

      const lines: string[] = this.lines.value.map((val: string) => val.trim());

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

      // Footer
      const footerText = 'Made with love for your handwriting journey.';
      const footerFontSize = 10;
      const footerTextWidth = helveticaFont.widthOfTextAtSize(
        footerText,
        footerFontSize
      );
      const footerCenterX = (this.PAGE_WIDTH - footerTextWidth) / 2;

      page.drawText(footerText, {
        x: footerCenterX,
        y: 36,
        size: footerFontSize,
        font: helveticaFont,
      });

      return await doc.save();
    } catch (error) {
      console.error(
        this.translate.instant('notification.pdfErrorGeneration'),
        error
      );
      return undefined;
    }
  }

  private drawTripleLines(page: PDFPage, yPosition: number): number {
    const lineSpacing = 32;
    const lineWidth = 468;

    // Solid top line
    page.drawLine({
      start: { x: 72, y: yPosition },
      end: { x: 72 + lineWidth, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Dashed middle line
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

    // Solid bottom line
    page.drawLine({
      start: { x: 72, y: yPosition - lineSpacing },
      end: { x: 72 + lineWidth, y: yPosition - lineSpacing },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    return lineSpacing;
  }
}
