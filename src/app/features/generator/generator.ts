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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Settings } from '../settings/settings';
import { WorksheetPdfService } from '../../core/services/worksheet-pdf';

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
  private worksheetPdfService = inject(WorksheetPdfService);

  private readonly initialLineCount = 6;
  private readonly linesPerPage = 6;

  public worksheetForm = new FormGroup({
    lines: new FormArray(
      Array.from(
        { length: 6 },
        () => this.createLineControl(),
      ),
    ),
  });
  public inputPlaceholder = signal<string>('');
  public isGenerating = signal<boolean>(false);
  public hasAnyInputValue = signal<boolean>(false);
  public activeView = signal<'edit' | 'preview'>('edit');

  private subs = new Subscription();

  public get lines(): FormArray {
    return this.worksheetForm.get('lines') as FormArray;
  }

  public get canRemoveLine(): boolean {
    return this.lines.length > this.initialLineCount;
  }

  public get estimatedPageCount(): number {
    return Math.ceil(this.lines.length / this.linesPerPage);
  }

  public get previewPages(): string[][] {
    const lineValues = this.lines.controls.map((control) =>
      (control.value ?? '').trim(),
    );
    const pages: string[][] = [];

    for (let index = 0; index < lineValues.length; index += this.linesPerPage) {
      pages.push(lineValues.slice(index, index + this.linesPerPage));
    }

    return pages;
  }

  constructor() {
    this.subs.add(
      this.worksheetForm.valueChanges.subscribe(() => {
        this.hasAnyInputValue.set(
          this.lines.controls.some(
            (ctrl) => !!ctrl.value && ctrl.value.trim().length > 0,
          ),
        );
      }),
    );
  }

  ngOnInit(): void {
    this.subs.add(
      this.translate.stream('worksheet.maxCharacters').subscribe((res) => {
        this.inputPlaceholder.set(res);
      }),
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

    const lines: string[] = this.lines.value.map((val: string) => val.trim());

    this.worksheetPdfService
      .generate(lines)
      .then((pdfBytes) => {
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
      .catch((error) => {
        console.error(
          this.translate.instant('notification.pdfErrorGeneration'),
          error,
        );
        alert(this.translate.instant('notification.warningGeneration'));
      })
      .finally(() => {
        this.isGenerating.set(false);
      });
  }

  public addLine(): void {
    this.lines.push(this.createLineControl());
  }

  public addLines(count: number): void {
    Array.from({ length: count }, () => this.addLine());
  }

  public addPage(): void {
    this.addLines(this.linesPerPage);
  }

  public removeLine(): void {
    if (!this.canRemoveLine) {
      return;
    }

    this.lines.removeAt(this.lines.length - 1);
  }

  public clearLines(): void {
    this.lines.controls.forEach((control) => control.setValue(''));
    this.hasAnyInputValue.set(false);
  }

  public showEditView(): void {
    this.activeView.set('edit');
  }

  public showPreviewView(): void {
    this.activeView.set('preview');
  }

  private createLineControl(): FormControl<string> {
    return new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.maxLength(30)],
    });
  }
}
