import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-generic-card',
  templateUrl: './generic-card.component.html',
  styleUrls: ['./generic-card.component.scss'],
})
export class GenericCardComponent implements OnInit {
  @Input() data: any;
  @Output() onClickEvent = new EventEmitter();
  @Input() buttonConfig: any;
  @Input() meta: any;
  @Input() cardConfig: any;
  @Input() disableButton: boolean;

  constructor(private router: Router, public utils: UtilService) {}

  ngOnInit() {
  }

  onCardClick(data) {
    this.router.navigate([
      CommonRoutes.MENTOR_DETAILS,
      data?.id || data?.user_id,
    ]);
  }
  handleButtonClick(action: string, data) {
    let value = {
      data: data.id || data.user_id,
      type: action,
      rid: data?.connection_meta?.room_id,
    };
    this.onClickEvent.emit(value);
  }
  showButton(event, data) {
    if (!event.hasCondition) {
      return true;
    } else if (event[event.onCheck] == data[event.onCheck]) {
      return true;
    } else {
      return false;
    }
  }
}
