import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
    constructor(
        private toastCtrl: ToastController,
        private translate : TranslateService
      ) { }

  private activeToast: HTMLIonToastElement | null = null;

  async showToast(msg, color, duration = 5000, toastButton = [], subText?: string, params?: any) {
  if (this.activeToast) {
    await this.activeToast.dismiss();
    this.activeToast = null;
  }
  
  const texts = await this.translate.get([msg],params).toPromise();
  const toast = await this.toastCtrl.create({
    message: subText ? '' : texts[msg], 
    color: color,
    duration: duration,
    position: 'top',
    buttons: toastButton,
    cssClass: 'custom-toast'
  });

  this.activeToast = toast;

  await toast.present();

  if (subText) {
    setTimeout(() => {
      const toastEl = document.querySelector('ion-toast');
      const shadow = toastEl?.shadowRoot;
      const msgDiv = shadow?.querySelector('.toast-message');
      if (msgDiv) {
        msgDiv.innerHTML = `
          <div class="toast-title">${texts[msg]}</div>
          <div class="toast-subtext">${subText}</div>
        `;
      }
    });
  }

  toast.onDidDismiss().then(() => {
    if (this.activeToast === toast) {
      this.activeToast = null;
    }
  });
}
}