import { Location } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent implements OnInit {
  @Input() config: any;
  @Output() actionEvent = new EventEmitter();

  constructor(private location:NavController) {}

  ngOnInit() {}

  onAction(event) {
    this.actionEvent.next(event);
  }

  onBack(){
    this.location.back();
  }
}
