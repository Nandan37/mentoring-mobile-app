import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ToastService } from 'src/app/core/services';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent implements OnInit {
  searchText: any;
  @Input() parentSearchText: string;
  @Input() data: any;
  @Input() overlayChip: any;
  @Output() outputData = new EventEmitter();
  @Input() valueFromParent: any;

  @Output() clearText = new EventEmitter<string>();
  @Input() placeholder: string;
  isOpen = false;
  criteriaChipSubscription: any;
  criteriaChip: any;
  showSelectedCriteria: any;



  constructor(
    private toast: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    if(this.parentSearchText)
      this.searchText = this.parentSearchText;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.resetSearch();
      });
  }
  ngOnChanges(){
    this.criteriaChip = this.valueFromParent;
  }
  selectChip(chip) {
    if (this.criteriaChip === chip) {
      this.criteriaChip = null;
    } else {
      this.criteriaChip = chip;
    }
  }

  async onSearch(event){
    if(event.length === 0) {
      const emitData = {
        searchText: '',
        criterias: this.criteriaChip
      }
      this.outputData.emit(emitData);
      return;
    }
    if (event.length >= 3) {
      this.searchText = event ? event : "";
      const emitData = {
        searchText: this.searchText.trim(),
        criterias: this.criteriaChip
      }
      this.outputData.emit(emitData);
    } else {
      this.toast.showToast("ENTER_MIN_CHARACTER","danger");
    }
    this.isOpen = false;
  }

  private resetSearch() {
    this.searchText = null;
  }

  onClearSearch() {
    this.isOpen =false;
    this.clearText.emit('')
    this.criteriaChip= undefined;
    }
}
