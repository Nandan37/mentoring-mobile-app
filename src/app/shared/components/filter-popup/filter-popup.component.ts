import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss'],
})
export class FilterPopupComponent implements OnInit {
  @Input() filterData: any;
  selectedFilters:any;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}
  
  filtersChanged(data:any){
      this.selectedFilters = data;
  }
  closePopup(){
    this.modalCtrl.dismiss({
      data: 'closed'
    });
  }

  onClickApply(){
    const selectedOptionsByCategory = {};
    this.filterData.forEach(category => {
      const selectedOptions = category.options.filter(option => option.selected);
      if (selectedOptions.length > 0) {
        const optionsWithCategory = selectedOptions.map(option => ({ ...option, categoryName: category.name }));
        selectedOptionsByCategory[category.name] = selectedOptionsByCategory[category.name] || [];
        selectedOptionsByCategory[category.name].push(...optionsWithCategory);
      }
    });
    const dataToSendBack = {
      selectedFilters: (
      this.selectedFilters &&                     
      typeof this.selectedFilters === 'object' && 
      Object.keys(this.selectedFilters).length > 0
    ) ? this.selectedFilters : selectedOptionsByCategory
    };
    this.modalCtrl.dismiss({
      data: dataToSendBack
    });
  }
}
