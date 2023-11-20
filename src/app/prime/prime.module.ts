import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SidebarModule } from 'primeng/sidebar';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SpeedDialModule } from 'primeng/speeddial';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { ChipsModule } from 'primeng/chips';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DynamicDialogModule,
    ColorPickerModule,
    SpeedDialModule,
    OverlayPanelModule,
    SidebarModule,
    ToastModule,
    MenuModule,
    AvatarModule,
    CalendarModule,
    ChipsModule,
    DividerModule,
    CheckboxModule,
    InputTextareaModule,
    FileUploadModule,
    ChipModule
  ], providers: [
    DialogService,
    MessageService,
  ],
  exports: [
    ButtonModule,
    DialogModule,
    DynamicDialogModule,
    ColorPickerModule,
    SpeedDialModule,
    OverlayPanelModule,
    SidebarModule,
    ToastModule,
    MenuModule,
    AvatarModule,
    CalendarModule,
    ChipsModule,
    DividerModule,
    CheckboxModule,
    InputTextareaModule,
    FileUploadModule,
    ChipModule
  ]
})
export class PrimeModule { }
