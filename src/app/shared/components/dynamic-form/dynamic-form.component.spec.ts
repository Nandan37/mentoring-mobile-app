import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { By } from '@angular/platform-browser';

import { DynamicFormComponent, JsonFormData } from './dynamic-form.component';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';
import { AttachmentService, ToastService } from 'src/app/core/services';

// ---- Stubs for child components ----

@Component({
  selector: 'app-search-and-select',
  template: ''
})
class SearchAndSelectComponentStub {
  @Input() formControlName!: string;
  @Input() control: any;
  @Input() uniqueId: any;
  @Input() sessionId: any;
  @Output() showSelectionPopover = new EventEmitter<any>();
}

@Component({
  selector: 'app-input-chip',
  template: ''
})
class InputChipStub {
  @Input() formControlName!: string;
  @Input() label!: string;
  @Input() chips: any[] = [];
  @Input() showSelectAll!: boolean;
  @Input() showAddOption!: boolean;
  @Input() validators: any;
  @Input() allowCustomEntities!: boolean;
}

@Component({
  selector: 'app-star-rating',
  template: ''
})
class StarRatingStub {
  @Input() formControlName!: string;
  @Input() label!: string;
  @Input() numberOfStars!: number;
}

// You can reuse the same format object from the component if exported,
// or just provide a minimal one like below:
const TEST_DATE_FORMATS = {
  fullPickerInput: {},
  datePickerInput: {},
  timePickerInput: {},
  monthYearLabel: {},
  dateA11yLabel: {},
  monthYearA11yLabel: {}
};

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;

  const mockToastService = jasmine.createSpyObj<ToastService>('ToastService', [
    'showToast'
  ]);
 const mockAttachmentService = jasmine.createSpyObj(
  'AttachmentService',
  ['upload']
) as jasmine.SpyObj<AttachmentService>;

  const mockJsonFormData: JsonFormData = {
    controls: [
      {
        name: 'firstName',
        label: 'First Name',
        value: '',
        type: 'text',
        class: 'col-12',
        position: 'left',
        validators: {
          required: true,
          maxLength: 10
        },
        errorMessage: {
          required: 'First name is required'
        },
        showField: true
      },
      {
        name: 'password',
        label: 'Password',
        value: '',
        type: 'password',
        class: 'col-12',
        position: 'left',
        validators: {
          required: true
        },
        errorMessage: {},
        showField: true
      },
      {
        name: 'role',
        label: 'Role',
        value: null,
        type: 'select',
        class: 'col-12',
        position: 'left',
        validators: {
          required: true
        },
        options: [
          { label: 'Teacher', value: 'teacher' },
          { label: 'Admin', value: 'admin' }
        ],
        errorMessage: {
          required: 'Role is required'
        },
        multiple: false,
        showField: true
      },
      {
        name: 'startDate',
        label: 'Start Date',
        value: null,
        type: 'date',
        class: 'col-12',
        position: 'left',
        validators: {
          required: true
        },
        errorMessage: {},
        showField: true
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DynamicFormComponent,
        SearchAndSelectComponentStub,
        InputChipStub,
        StarRatingStub
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        IonicModule.forRoot()
      ],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: AttachmentService, useValue: mockAttachmentService },
        { provide: OWL_DATE_TIME_FORMATS, useValue: TEST_DATE_FORMATS }
      ],
      // Handles ion-*, mat-*, owl-* etc without importing their modules
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    // Supply the input before first detectChanges so ngOnInit has data
    component.jsonFormData = JSON.parse(JSON.stringify(mockJsonFormData));
  });

  // Helper to initialize after spying on outputs if needed
  function init() {
    spyOn(component.formValid, 'emit');
    fixture.detectChanges(); // triggers ngOnInit + createForm
  }

  it('should create', () => {
    init();
    expect(component).toBeTruthy();
  });

 it('should build form controls based on jsonFormData and emit formValid', fakeAsync(() => {
    spyOn(component.formValid, 'emit');
    fixture.detectChanges();
    tick();

    expect(component.myForm.contains('firstName')).toBeTrue();
    expect(component.myForm.contains('password')).toBeTrue();
    expect(component.myForm.contains('role')).toBeTrue();
    expect(component.myForm.contains('startDate')).toBeTrue();

    expect(component.formValid.emit).toHaveBeenCalledWith(component.myForm.valid);
  }));

  it('should apply required and maxLength validators for firstName', fakeAsync(() => {
    init();
    tick();
    const firstNameControl = component.myForm.get('firstName')!;

    firstNameControl.setValue('');
    expect(firstNameControl.invalid).toBeTrue();
    expect(firstNameControl.errors?.['required']).toBeTrue();

    firstNameControl.setValue('thisislongerthan10');
    expect(firstNameControl.invalid).toBeTrue();
    expect(firstNameControl.errors?.['maxlength']).toBeTruthy();

    firstNameControl.setValue('John');
    expect(firstNameControl.valid).toBeTrue();
  }));

  it('should sort select options by label on init', () => {
    init();

    const roleConfig = component.jsonFormData.controls.find(
      c => c.name === 'role'
    );
    expect(roleConfig).toBeTruthy();
    const options = (roleConfig!.options || []) as any[];

    // Sorted alphabetically by label: Admin, Teacher
    expect(options[0].label).toBe('Admin');
    expect(options[1].label).toBe('Teacher');
  });

  it('should initialize select value as empty string when value is null and multiple=false', fakeAsync(() => {
    init();
    tick();
    const roleFormControl = component.myForm.get('role')!;
    expect(roleFormControl.value).toBe(''); // as per component logic
  }));

  it('compareWith should compare flattened values correctly', () => {
    init();
    expect(component.compareWith(['a'], ['a'])).toBeTrue();
    expect(component.compareWith('a', ['a'])).toBeTrue();
    expect(component.compareWith(['a', 'b'], ['a', 'b'])).toBeTrue();
    expect(component.compareWith(['a'], ['b'])).toBeFalse();
  });

  it('hideShowPassword should toggle password field type and set showPasswordIcon', () => {
    init();
    const pwdConfig = component.jsonFormData.controls.find(
      c => c.name === 'password'
    )!;
    expect(pwdConfig.type).toBe('password');

    component.hideShowPassword(pwdConfig);
    expect(pwdConfig.type).toBe('text');
    expect(pwdConfig.showPasswordIcon).toBeTrue();

    component.hideShowPassword(pwdConfig);
    expect(pwdConfig.type).toBe('password');
    expect(pwdConfig.showPasswordIcon).toBeTrue();
  });

it('dateSelected should not allow date before currentDate', fakeAsync(() => {
  // let ngOnInit run and the setTimeout(createForm) finish
  spyOn(component.formValid, 'emit');
  fixture.detectChanges();
  tick();  // <- this is critical

  const controlConfig = component.jsonFormData.controls.find(
    c => c.name === 'startDate'
  )!;
  const formControl = component.myForm.get('startDate')!;
  const today = new Date(2020, 0, 2);
  const yesterday = new Date(2020, 0, 1);

  component.currentDate = today;

  const event: any = { value: yesterday };

  component.dateSelected(event, controlConfig);

  expect(formControl.value).toEqual(today);
}));


  it('selectionChanged should update jsonFormData and emit formValueChanged', () => {
    init();

    spyOn(component.formValueChanged, 'emit');
    const control = component.jsonFormData.controls.find(
      c => c.name === 'role'
    )!;
    const event: any = { detail: { value: 'admin' } };

    component.selectionChanged(control, event);

    const updated = component.jsonFormData.controls.find(
      c => c.name === 'role'
    )!;
    expect(updated.value).toBe('admin');
    expect(component.formValueChanged.emit).toHaveBeenCalledWith(control);
  });

  it('removeSpace should trim only leading spaces', () => {
    init();
    const event: any = { target: { value: '   hello world  ' } };
    component.removeSpace(event);
    expect(event.target.value).toBe('hello world  ');
  });

  it('onEnterPress should emit onEnter when form is valid', fakeAsync(() => {
  init(); 
  tick();
  spyOn(component.onEnter, 'emit');

  component.myForm.get('firstName')!.setValue('John');
  component.myForm.get('password')!.setValue('1234');
  component.myForm.get('role')!.setValue('admin');
  component.myForm.get('startDate')!.setValue(new Date());

  expect(component.myForm.valid).toBeTrue();

  const keyboardEvent = new KeyboardEvent('keyup', { key: 'Enter' });
  component.onEnterPress(keyboardEvent);

  expect(component.onEnter.emit).toHaveBeenCalledWith(keyboardEvent);
}));


  it('onEnterPress should NOT emit onEnter when form is invalid', fakeAsync(() => {
    init();
    tick();
    spyOn(component.onEnter, 'emit');

    component.myForm.get('firstName')!.setValue('');
    expect(component.myForm.valid).toBeFalse();

    const keyboardEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    component.onEnterPress(keyboardEvent);

    expect(component.onEnter.emit).not.toHaveBeenCalled();
  }));

  it('openDynamicSelectModal should emit dynamicSelectClicked', () => {
    init();
    spyOn(component.dynamicSelectClicked, 'emit');

    component.openDynamicSelectModal();

    expect(component.dynamicSelectClicked.emit).toHaveBeenCalled();
  });

  it('uploadPhoto with REMOVE_PHOTO should clear control value', fakeAsync(() => {
    init();
    tick();
    const control = component.jsonFormData.controls.find(
      c => c.name === 'firstName'
    )!;
    component.myForm.get('firstName')!.setValue('some value');

    component.uploadPhoto('REMOVE_PHOTO', control);

    expect(component.myForm.get('firstName')!.value).toBe('');
  }));

  it('isFormValid should return form statusChanges observable', () => {
    init();
    const status$ = component.isFormValid();
    expect(status$).toBe(component.myForm.statusChanges);
  });
});
