import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from 'src/app/core/services';

@Component({
  selector: 'app-add-link-modal',
  templateUrl: './pre-alert-modal.component.html',
  styleUrls: ['./pre-alert-modal.component.scss']
})
export class PreAlertModalComponent {
  @Input() data: any;
  @Input() type: 'link' | 'file' = 'link'; 
  
  title: string = '';
  name: string = '';

  constructor(
    private modalController: ModalController,
    private translateService: TranslateService,
    private toast: ToastService,
  ) {}

  dismissModal() {
    this.modalController.dismiss();
  }

  saveLink() {
    if (this.name && (this.name.startsWith('http://') || this.name.startsWith('https://'))) {
      const obj = {
        name: this.name,
        title: this.title,
        type: this.data.name,
        isLink: true,
        isNew: true
      };
      
      this.modalController.dismiss({
        data: obj,
        success: true
      });
    } else {
      this.toast.showToast(this.translateService.instant('INVALID_LINK'), 'danger');
      return;
    }
  }
}