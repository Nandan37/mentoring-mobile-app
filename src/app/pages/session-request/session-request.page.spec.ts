import 'zone.js';          
import 'zone.js/testing';  

/* session-request.page.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SessionRequestPage } from './session-request.page';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';


// Services tokens / paths — adjust if your project uses different paths
import { ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { SessionService } from 'src/app/core/services/session/session.service';

// ---- Mocks / stubs ----
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockToastService {
  showToast = jasmine.createSpy('showToast');
}

class MockFormService {
  getForm = jasmine.createSpy('getForm').and.returnValue(Promise.resolve({ data: { fields: { /* whatever shape */ } } }));
}

class MockSessionService {
  requestSession = jasmine.createSpy('requestSession').and.returnValue(Promise.resolve({ message: 'requested' }));
}

class MockModalController {
  create = jasmine.createSpy('create').and.callFake(() => {
    return Promise.resolve({
      onDidDismiss: () => Promise.resolve({ data: null }),
      present: () => Promise.resolve()
    });
  });
}

class MockUtilService {
  // convertDatesToTimezone should return object with eventStartEpochInSelectedTZ and eventEndEpochInSelectedTZ
  convertDatesToTimezone = jasmine.createSpy('convertDatesToTimezone').and.callFake((start, end, tz) => {
    // Return epoch ms numbers for simplicity
    return {
      eventStartEpochInSelectedTZ: 1609459200000, // Jan 1, 2021 00:00:00 UTC
      eventEndEpochInSelectedTZ: 1609462800000 // +1 hour
    };
  });
}

// Minimal stub of DynamicFormComponent for the ViewChild
class DummyForm {
  myForm = {
    get valid() { return true; },              // getter — spyOnProperty can override
    getRawValue: () => ({ 
      start_date: '2021-01-01T00:00:00', 
      end_date: '2021-01-01T01:00:00' 
    }),
    value: {},
    markAsPristine: jasmine.createSpy('markAsPristine')
  };

  onSubmit = jasmine.createSpy('onSubmit');
  reset = jasmine.createSpy('reset');
}

describe('SessionRequestPage', () => {
  let component: SessionRequestPage;
  let fixture: ComponentFixture<SessionRequestPage>;

  let mockRouter: MockRouter;
  let mockToast: MockToastService;
  let mockFormService: MockFormService;
  let mockSessionService: MockSessionService;
  let mockModalCtrl: MockModalController;
  let mockUtil: MockUtilService;

  beforeEach(waitForAsync(async () => {
    mockRouter = new MockRouter();
    mockToast = new MockToastService();
    mockFormService = new MockFormService();
    mockSessionService = new MockSessionService();
    mockModalCtrl = new MockModalController();
    mockUtil = new MockUtilService();

    await TestBed.configureTestingModule({

      imports: [
    TranslateModule.forRoot({
    })
    
  ],
      
      declarations: [SessionRequestPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            // provide an observable for queryParams used in ionViewWillEnter
            queryParams: of({ data: 42 })
          }
        },
        { provide: ToastService, useValue: mockToast },
        { provide: FormService, useValue: mockFormService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: ModalController, useValue: mockModalCtrl },
        { provide: UtilService, useValue: mockUtil },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionRequestPage);
    component = fixture.componentInstance;

    // Attach a dummy form to the ViewChild (so component.form1 isn't undefined)
    component.form1 = new DummyForm() as any;

    // fixture.detectChanges();
    // await fixture.whenStable();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillEnter should set ids.requestee_id and fetch formData via form.getForm', async () => {
    // Ensure getForm spy is defined to resolve
    (mockFormService.getForm as jasmine.Spy).and.returnValue(Promise.resolve({ data: { fields: { foo: 'bar' } } }));

    // Call lifecycle method
    await component.ionViewWillEnter();

    // Query param 'data' -> assigned to ids.requestee_id
    expect(component.ids.requestee_id).toBe(42);
    expect(mockFormService.getForm).toHaveBeenCalled();
    expect(component.formData).toBeDefined();
    expect(component.formData.foo).toBe('bar');
  });

  it('onDynamicSelectClicked should open modal and set selectedTimezone when dismissed with data', async () => {
    // Arrange: make modal return a value on dismiss
    const returned = { data: 'Asia/Kolkata' };
    (mockModalCtrl.create as jasmine.Spy).and.returnValue(Promise.resolve({
      onDidDismiss: () => Promise.resolve(returned),
      present: () => Promise.resolve()
    } as any));

    // ensure selectedTimezone changes after dismissal
    component.selectedTimezone = 'UTC';
    await component.onDynamicSelectClicked();

    expect(mockModalCtrl.create).toHaveBeenCalled();
    // after dismiss the selected timezone should be set
    expect(component.selectedTimezone).toBe('Asia/Kolkata');
  });

  it('onSubmit should not call requestSession when form invalid', async () => {
    // Mark form invalid
    spyOnProperty(component.form1.myForm, 'valid', 'get').and.returnValue(false);
    component.isSubmited = false;

    // Spy on sessionService.requestSession to ensure not called
    (mockSessionService.requestSession as jasmine.Spy).and.callThrough();

    component.onSubmit();

    // since form invalid, requestSession should not be called
    expect(mockSessionService.requestSession).not.toHaveBeenCalled();
  });

  it('onSubmit should call requestSession and navigate & show toast when form valid', async () => {
    // Arrange: ensure form is valid and myForm.getRawValue returns expected values
    spyOnProperty(component.form1.myForm, 'valid', 'get').and.returnValue(true);
    component.isSubmited = false;

    // Ensure utilService returns predictable epoch values (already stubbed in mockUtil)
    (mockUtil.convertDatesToTimezone as jasmine.Spy).and.returnValue({
      eventStartEpochInSelectedTZ: 1609459200000,
      eventEndEpochInSelectedTZ: 1609462800000
    });

    // Make sessionService.requestSession resolve with an object containing a message
    (mockSessionService.requestSession as jasmine.Spy).and.returnValue(Promise.resolve({ message: 'ok' }));

    // Put an id into ids (requestee_id) to ensure form includes it
    component.ids = { requestee_id: 100 };

    // Act
    component.onSubmit();

    // onSubmit triggers an async requestSession, await it by waiting for promise resolution:
    await (mockSessionService.requestSession as jasmine.Spy).calls.mostRecent().returnValue;

    // Assert
    expect(mockUtil.convertDatesToTimezone).toHaveBeenCalled();
    expect(mockSessionService.requestSession).toHaveBeenCalled();
    // router.navigate should be called with the correct path (using CommonRoutes in component)
    expect(mockRouter.navigate).toHaveBeenCalled();
    expect(mockToast.showToast).toHaveBeenCalledWith('ok', 'success');
    expect(component.isSubmited).toBeTrue();
    expect(component.form1.reset).toHaveBeenCalled();
    // markAsPristine should have been called on the inner form
    expect(component.form1.myForm.markAsPristine).toHaveBeenCalled();
  });

});
