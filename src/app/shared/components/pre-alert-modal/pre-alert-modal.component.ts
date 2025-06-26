import { Component, Input } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from 'src/app/core/services';

@Component({
  selector: 'app-add-link-modal',
  templateUrl: './pre-alert-modal.component.html',
  styleUrls: ['./pre-alert-modal.component.scss'],
})
export class PreAlertModalComponent {

  @Input() data: any;
  @Input() type: 'link' | 'file' = 'link';

  name: string = '';
  link: string = '';
  uploadedFile: File;

  constructor(
    private modalController: ModalController,
    private translateService: TranslateService,
    private toast: ToastService,
    private actionSheetController: ActionSheetController
  ) {}

  dismissModal() {
    this.modalController.dismiss();
  }

  saveLink() {
    if (this.type === 'file') {
      if(this.uploadedFile && this.name) {
        const obj = {
          name: this.name, 
          file: this.uploadedFile
        };
        this.modalController.dismiss({
          data: obj,
          success: true,
        });
      } else {
        this.toast.showToast(
          this.translateService.instant('INVALID_FILE'),
          'danger'
        );
        return;
      }
    } else {
      if (
        this.link && this.name &&
        (this.link.startsWith('http://') || this.link.startsWith('https://'))
      ) {
        const obj = {
          name: this.name,
          link: this.link,
          type: this.data.name,
          isLink: true,
          isNew: true,
        };

        this.modalController.dismiss({
          data: obj,
          success: true,
        });
      } else {
        this.toast.showToast(
          this.translateService.instant('INVALID_LINK'),
          'danger'
        );
        return;
      }
    }
  }
  uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    
    input.addEventListener('change', (fileEvent: any) => {
      try {
        if (!fileEvent.target.files || fileEvent.target.files.length === 0) {
          this.toast.showToast(
            this.translateService.instant('No file selected'),
            'danger'
          );
          return;
        }
        const file = fileEvent.target.files[0];
        if (!file) {
          return;
        }
        if (!file.type || file.type.trim() === '') {
          this.toast.showToast(
            this.translateService.instant('Cannot upload file: File type is not detected. Please try a different file.'),
            'danger'
          );
          return;
        }
        if (!file.name || file.name.trim() === '') {
          return;
        }
        this.uploadedFile = file;
        
      } catch (error) {
        console.error('Error during file selection:', error);
      }
    });
    
    input.click();
  }
  async openFilePicker() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        const actionSheet = await this.actionSheetController.create({
            header: 'Select Resource',
            buttons: [
                {
                    text: 'Camera',
                    icon: 'camera',
                    handler: () => {
                        this.openCamera();
                    }
                },
                {
                    text: 'File',
                    icon: 'folder',
                    handler: () => {
                        this.uploadFile();
                    }
                },
                {
                    text: 'Cancel',
                    icon: 'close',
                    role: 'cancel'
                }
            ]
        });
        await actionSheet.present();
    } else {
      this.uploadFile()
    }
  
  }
  openCamera() {
  }



  removeFile() {
    this.uploadedFile = null;
    }
}
