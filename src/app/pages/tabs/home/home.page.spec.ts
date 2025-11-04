import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { HomePage } from './home.page';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { LocalStorageService, ToastService, UserService, UtilService } from 'src/app/core/services';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';

fdescribe('HomePage - Simple Test', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockLocalStorage: jasmine.SpyObj<LocalStorageService>;
  let mockToast: jasmine.SpyObj<ToastService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockUtilService: jasmine.SpyObj<UtilService>;
  let userEventSubject: Subject<any>;

   const mockUser = {
    id: '123',
    about: 'Test user',
    profile_mandatory_fields: [],
    terms_and_conditions: true
  };
const mockSessions = {
  result: {  
    all_sessions: [],
    my_sessions: [],
    allSessions_count: 2,
    my_sessions_count: 1
  }
};

  const mockCreatedSessions = {
    data: [],
    count: 2

  }

  const mockPlatformConfig = {
    result: {
      search_config: {
        search: {
          session: {
            fields: [
              { name: 'category', label: 'Category' },
              { name: 'type', label: 'Type' }
            ]
          }
        }
      }
    }
  };

  beforeEach(async () => {
    userEventSubject = new Subject();
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockProfileService = jasmine.createSpyObj('ProfileService', [
    'getProfileDetailsFromAPI',
    'upDateProfilePopup'
    ]);
    mockSessionService = jasmine.createSpyObj('SessionService', [
      'getSessions',
      'getAllSessionsAPI',
      'joinSession',
      'enrollSession',
      'startSession'
    ]);
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);
    mockUserService = jasmine.createSpyObj('UserService', [], {
      userEventEmitted$: userEventSubject.asObservable()
    });
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', [
      'getLocalData',
      'setLocalData'
    ]);
    mockToast = jasmine.createSpyObj('ToastService', ['showToast']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['getPlatformConfig']);
    mockUtilService = jasmine.createSpyObj('UtilService', [
      'subscribeSearchText',
      'subscribeCriteriaChip'
    ]);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot(),  OverlayModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: ProfileService, useValue: mockProfileService},
        { provide: SessionService, useValue: mockSessionService},
        { provide: ModalController, useValue: mockModalController},
        { provide: UserService, useValue: mockUserService},
        { provide: LocalStorageService, useValue: mockLocalStorage},
        { provide: ToastService, useValue: mockToast},
        { provide: PermissionService, useValue: mockPermissionService},
        { provide: UtilService, useValue: mockUtilService},
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  afterEach(() => {
    fixture.destroy();
  });

  it('should create the HomePage', () => {
    expect(component).toBeTruthy(); 
  });
  
  it('should initialize with default values"', () => {
    expect(component.selectedSegment).toBe('all-sessions'); 
    expect(component.page).toBe(1);
    expect(component.limit).toBe(100);
    expect(component.selectedSegment).toBe('all-sessions');
    expect(component.showBecomeMentorCard).toBe(false);
    expect(component.chips).toEqual([]);
    expect(component.isOpen).toBe(false);
  });

   it('should initialize session form with empty values', () => {
      expect(component.sessionForm.value).toEqual({
        date: '',
        time: '',
        duration: '',
        link: ''
      });
    });

    it('should have correct header config', () => {
      expect(component.headerConfig).toEqual({
        menu: true,
        notification: true,
        headerColor: 'primary'
      });
    });

  it('gotToTop should call scrollToTop on content', () => {
    component.content = { 
      scrollToTop: jasmine.createSpy().and.returnValue(Promise.resolve()) 
    } as any;
    
    component.gotToTop();
    expect(component.content.scrollToTop).toHaveBeenCalledWith(1000);
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
        component.content = { 
      scrollToTop: jasmine.createSpy('scrollToTop').and.returnValue(Promise.resolve()) 
    } as any;

      mockProfileService.getProfileDetailsFromAPI.and.returnValue(
        Promise.resolve({id: 1, about: 'test', profile_mandatory_fields: []})
      );
      mockLocalStorage.getLocalData.and.returnValue(
        Promise.resolve(['mentor'])
      );
      mockPermissionService.getPlatformConfig.and.returnValue(
        Promise.resolve(mockPlatformConfig)
      );
      mockSessionService.getSessions.and.returnValue(
        Promise.resolve(mockSessions)
      );
      mockSessionService.getAllSessionsAPI.and.returnValue(
        Promise.resolve(mockCreatedSessions)
      );
  mockUtilService.subscribeSearchText.and.callFake(() => {});
  mockUtilService.subscribeCriteriaChip.and.callFake(() => {});

    })

    it('it should load user data', fakeAsync(() => {
      component.ionViewWillEnter();
      tick();
      expect(mockProfileService.getProfileDetailsFromAPI).toHaveBeenCalledWith();
    }));
    // it('should set isMentor to true when user has mentor role', fakeAsync(() => {
    //   mockLocalStorage.getLocalData.and.callFake((key) => {
    //     if (key === localKeys.USER_ROLES) return Promise.resolve(['mentor']);
    //     return Promise.resolve(null);
    //   });

    //   component.ionViewWillEnter();
    //   tick();
      
    //   expect(component.isMentor).toBe(true);
    // }));

    // it('should not show become mentor card if the role is requested', fakeAsync(() => {
    //   mockLocalStorage.getLocalData.and.callFake((key) => {
    //       if(key === localKeys.IS_BECOME_MENTOR_TILE_CLOSED) 
    //         return Promise.resolve(true);
    //       return Promise.resolve(null);
    //   })
    //   component.ionViewWillEnter();
    //   tick();

    //   expect(component.showBecomeMentorCard).toBe(false);
    // }));

    // it('should subscribe to user events', fakeAsync(() => {
    //   component.ionViewWillEnter();
    //   tick();

    //   userEventSubject.next(mockUser);
    //   expect(component.user).toEqual(mockUser)
    // }));

    // it('should load platform config chips', fakeAsync(() => {
    //   component.ionViewWillEnter();
    //   tick();

    //   expect(component.chips).toEqual(mockPlatformConfig.result.search_config.search.session.fields)
    // }));

  })
});