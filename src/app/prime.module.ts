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
    CalendarModule
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
    CalendarModule
  ]
})
export class PrimeModule { }
