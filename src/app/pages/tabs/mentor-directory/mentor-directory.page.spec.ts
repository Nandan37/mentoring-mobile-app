import 'zone.js';          
import 'zone.js/testing';  

/* mentor-directory.page.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MentorDirectoryPage } from './mentor-directory.page';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// import service tokens exactly as used in your component
import { HttpService, LoaderService, ToastService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { LocalStorageService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
import { TranslateModule } from '@ngx-translate/core';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockLoaderService {
  startLoader = jasmine.createSpy('startLoader').and.returnValue(Promise.resolve());
  stopLoader = jasmine.createSpy('stopLoader').and.returnValue(Promise.resolve());
}

class MockHttpService {
  get = jasmine.createSpy('get').and.callFake((config) => {
    // default implementation returns an empty page
    return Promise.resolve({
      result: {
        data: [],
        count: 0
      }
    });
  });
}

class MockToastService {
  show = jasmine.createSpy('show');
}

class MockFormService {
  getForm = jasmine.createSpy('getForm').and.callFake((formName) => {
    return Promise.resolve({ data: { fields: { controls: [] } } });
  });
}

class MockLocalStorageService {
  getLocalData = jasmine.createSpy('getLocalData').and.callFake((key) => {
    return Promise.resolve({ id: 42, name: 'current-user' });
  });
}

describe('MentorDirectoryPage', () => {
  let component: MentorDirectoryPage;
  let fixture: ComponentFixture<MentorDirectoryPage>;
  let router: MockRouter;
  let loaderService: MockLoaderService;
  let httpService: MockHttpService;
  let toastService: MockToastService;
  let formService: MockFormService;
  let localStorage: MockLocalStorageService;

  beforeEach(waitForAsync(async () => {
    router = new MockRouter();
    loaderService = new MockLoaderService();
    httpService = new MockHttpService();
    toastService = new MockToastService();
    formService = new MockFormService();
    localStorage = new MockLocalStorageService();

    await TestBed.configureTestingModule({

      imports: [
        TranslateModule.forRoot({
        })
      ],
      declarations: [MentorDirectoryPage],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ button_config: [{ id: 'btn1', label: 'Connect' }] }),
            snapshot: { queryParams: {} }
          }
        },
        { provide: LoaderService, useValue: loaderService },
        { provide: HttpService, useValue: httpService },
        { provide: ToastService, useValue: toastService },
        { provide: FormService, useValue: formService },
        { provide: LocalStorageService, useValue: localStorage },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MentorDirectoryPage);
    component = fixture.componentInstance;

    // stub IonContent ViewChild so scrollToTop won't throw
    (component as any).content = { scrollToTop: jasmine.createSpy('scrollToTop') } as any;

    // ensure template-bound properties are initialized before change detection
    component.buttonConfig = [{ id: 'btn1', label: 'Connect' }];
    component.searchText = '';
    component.mentorForm = {};
    component.mentors = [];

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should read button_config from route data', () => {
    component.ngOnInit();
    expect(component.buttonConfig).toBeDefined();
    expect(Array.isArray(component.buttonConfig)).toBeTrue();
    expect(component.buttonConfig.length).toBeGreaterThan(0);
  });

  it('ionViewWillEnter should fetch user, form, initialize and call getMentors and gotToTop', async () => {
    spyOn(component, 'getMentors').and.returnValue(Promise.resolve());
    // ensure content spy exists
    (component as any).content = { scrollToTop: jasmine.createSpy('scrollToTop') } as any;

    await component.ionViewWillEnter();

    expect(localStorage.getLocalData).toHaveBeenCalled();
    expect(formService.getForm).toHaveBeenCalledWith(jasmine.anything());
    expect(component.currentUserId).toBe(42);
    expect(component.page).toBe(1);
    expect(component.mentors).toEqual([]);
    expect(component.isInfiniteScrollDisabled).toBeFalse();
    expect(component.getMentors).toHaveBeenCalled();
    expect((component as any).content.scrollToTop).toHaveBeenCalled();
  });

  it('getMentors should populate mentors, mentorsCount, map buttonConfig and disable infinite when total values >= count', async () => {
    // Create mock data shaped as groups with values arrays
    const mockData = {
      result: {
        data: [
          { values: [{ id: 1 }, { id: 2 }] },
          { values: [{ id: 3 }] }
        ],
        count: 3
      }
    };
    (httpService.get as jasmine.Spy).and.returnValue(Promise.resolve(mockData));

    // ensure current user id is one of mentors to test hide logic
    component.currentUserId = 2;
    component.buttonConfig = [{ id: 'a', label: 'A' }];

    await component.getMentors(true, false);

    expect(httpService.get).toHaveBeenCalled();
    expect(component.data).toBeDefined();
    expect(Array.isArray(component.mentors)).toBeTrue();
    expect(component.mentors.length).toBe(2); // two groups returned
    expect(component.mentorsCount).toBe(3);
    // totalValues = 2 + 1 = 3 -> isInfiniteScrollDisabled true
    expect(component.isInfiniteScrollDisabled).toBeTrue();

    // Check that each mentor in values has buttonConfig and that id==currentUserId has isHide true
    const flattened = component.mentors.reduce((acc: any[], g: any) => acc.concat(g.values || []), []);

    expect(flattened.every((m: any) => Array.isArray(m.buttonConfig))).toBeTrue();
    const mentorWithId2 = flattened.find((m: any) => m.id === 2);
    expect(mentorWithId2).toBeDefined();
    // find a mapped button and check for isHide flag on that mentor
    expect(mentorWithId2.buttonConfig.some((b: any) => b.isHide === true)).toBeTrue();
  });

  it('getMentors should append mentors on load more', async () => {
    // first call returns 1 group
    const first = { result: { data: [{ values: [{ id: 1 }] }], count: 2 } };
    const second = { result: { data: [{ values: [{ id: 2 }] }], count: 2 } };
    (httpService.get as jasmine.Spy).and.returnValues(Promise.resolve(first), Promise.resolve(second));

    component.buttonConfig = [{ id:'x', label:'X' }];
    component.currentUserId = 999; // no hiding

    // initial fetch (not load more)
    await component.getMentors(true, false);
    expect(component.mentors.length).toBe(1);

    // now simulate load more (isLoadMore true); mentors should append
    await component.getMentors(false, true);
    expect(component.mentors.length).toBe(2);
  });

  it('getMentors should handle error and stop loader', async () => {
    (httpService.get as jasmine.Spy).and.returnValue(Promise.reject(new Error('boom')));
    // removed duplicate spyOn because loaderService methods are already spies in MockLoaderService

    await component.getMentors(true, false);

    // assert existing spies were called
    expect(loaderService.startLoader).toHaveBeenCalled();
    expect(loaderService.stopLoader).toHaveBeenCalled();
    expect(component.isLoaded).toBeTrue();
    expect(component.isInfiniteScrollDisabled).toBeTrue();
  });

  it('eventAction should navigate for cardSelect, chat, and requestSession', () => {
    component.eventAction({ type: 'cardSelect', data: { id: 11 } } as any);
    expect(router.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, 11]);

    component.eventAction({ type: 'chat', data: { id: 22 } } as any);
    expect(router.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT_REQ, { id: 22 }], { queryParams: { id: 22 } });

    component.eventAction({ type: 'requestSession', data: 33 } as any);
    expect(router.navigate).toHaveBeenCalledWith([CommonRoutes.SESSION_REQUEST], { queryParams: { data: 33 } });
  });

  it('loadMore should increment page, call getMentors and complete event', async () => {
    const mockEvent: any = { target: { complete: jasmine.createSpy('complete') } };
    spyOn(component, 'getMentors').and.returnValue(Promise.resolve());

    component.data = { result: { data: [{ values: [] }] } }; // simulate data present
    component.isInfiniteScrollDisabled = false;
    component.page = 1;

    await component.loadMore(mockEvent);

    expect(component.page).toBe(2);
    expect(component.getMentors).toHaveBeenCalled();
    expect(mockEvent.target.complete).toHaveBeenCalled();
  });

  it('onSearch should navigate to mentor search directory with query param', () => {
    component.searchText = 'hello';
    component.onSearch();
    expect(router.navigate).toHaveBeenCalledWith(['/' + CommonRoutes.MENTOR_SEARCH_DIRECTORY], {
      queryParams: { search: 'hello' }
    });
  });

});
