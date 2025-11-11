import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
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
import { promise } from 'protractor';
import { count } from 'console';
import { CommonRoutes } from 'src/global.routes';
import { environment } from 'src/environments/environment';

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
    it('should set isMentor to true when user has mentor role', fakeAsync(() => {
      mockLocalStorage.getLocalData.and.callFake((key) => {
        if (key === localKeys.USER_ROLES) return Promise.resolve(['mentor']);
        return Promise.resolve(null);
      });

      component.ionViewWillEnter();
      tick();
      
      expect(component.isMentor).toBe(true);
    }));

    it('should not show become mentor card if the role is requested', fakeAsync(() => {
      mockLocalStorage.getLocalData.and.callFake((key) => {
          if(key === localKeys.IS_BECOME_MENTOR_TILE_CLOSED) 
            return Promise.resolve(true);
          return Promise.resolve(null);
      })
      component.ionViewWillEnter();
      tick();

      expect(component.showBecomeMentorCard).toBe(false);
    }));

    it('should subscribe to user events', fakeAsync(() => {
      component.ionViewWillEnter();
      tick();

      userEventSubject.next(mockUser);
      expect(component.user).toEqual(mockUser)
    }));

    it('should load platform config chips', fakeAsync(() => {
      component.ionViewWillEnter();
      tick();

      expect(component.chips).toEqual(mockPlatformConfig.result.search_config.search.session.fields)
    }));

    it('should call gotToTop', fakeAsync(() => {
      component.content = { scrollToTop: jasmine.createSpy() } as any;
      
      component.ionViewWillEnter();
      tick();
      
      expect(component.content.scrollToTop).toHaveBeenCalledWith(1000);
    }));

      it('should reset pages and sessions', fakeAsync(async () => {

    component.page = 5;
    component.sessions = { all_sessions: [{ id: 999 }] };
    component.createdSessions = { data: [{ id: 888 }] };
    component.user = { profile_mandatory_fields: [] }; 

    spyOn(component, 'getUser').and.returnValue(Promise.resolve());
    mockLocalStorage.getLocalData.and.returnValue(Promise.resolve([]));
    mockPermissionService.getPlatformConfig.and.returnValue(
      Promise.resolve({
        result: {
          search_config: {
            search: {
              session: {
                fields: []
              }
            }
          }
        }
      })
    );

    spyOn(component, 'loadSegmentData').and.returnValue(Promise.resolve());


    mockUserService.userEventEmitted$ = of(null);


    await component.ionViewWillEnter();
    tick(); 

    expect(component.page).toBe(1);
    expect(component.sessions).toBeNull();
    expect(component.createdSessions).toBeNull();
  }));

  

  });

  describe('loadSegment', () => {
    beforeEach(() => {
      mockSessionService.getSessions.and.returnValue(Promise.resolve(mockSessions));
      mockSessionService.getAllSessionsAPI.and.returnValue(Promise.resolve(mockCreatedSessions));
    });
    it('should all load allsession', fakeAsync(() => {
      component.loadSegmentData('all-sessions');
      tick();

      expect(mockSessionService.getSessions).toHaveBeenCalledWith({page:1, limit:100, scope: 'all'});
      expect(component.sessions).toEqual(mockSessions.result);
      expect(component.allSessionsCount).toBe(2);
    }));

      it('should load created sessions for mentors', fakeAsync(() => {
      component.isMentor = true;
      
      component.loadSegmentData('created-sessions');
      tick();
      
      expect(mockSessionService.getAllSessionsAPI).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        searchText: ''
      });
      expect(component.createdSessions).toEqual(mockCreatedSessions);
      expect(component.createdSessionsCount).toBe(2);
    }));

        it('should set empty created sessions for non-mentors', fakeAsync(() => {
      component.isMentor = false;
      
      component.loadSegmentData('created-sessions');
      tick();
      
      expect(component.createdSessions).toEqual({ data: [] });
      expect(component.createdSessionsCount).toBe(0);
    }));

     it('should set isCreatedSessions flag when no created sessions', fakeAsync(() => {
      component.isMentor = true;
      mockSessionService.getAllSessionsAPI.and.returnValue(
        Promise.resolve({ data: [], count: 0 })
      );
      
      component.loadSegmentData('created-sessions');
      tick();
      
      expect(component.isCreatedSessions).toBe(true);
    }));

        it('should load enrolled sessions', fakeAsync(() => {
      component.loadSegmentData('my-sessions');
      tick();
      
      expect(mockSessionService.getSessions).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        scope: 'my'
      });
      expect(component.enrolledSessionsCount).toBe(1);
    }));

        it('should set isEnrolledSession flag when no enrolled sessions', fakeAsync(() => {
      mockSessionService.getSessions.and.returnValue(
        Promise.resolve({ result: { my_sessions: [], my_sessions_count: 0 } })
      );
      
      component.loadSegmentData('my-sessions');
      tick();
      
      expect(component.isEnrolledSession).toBe(true);
    }));

        it('should append data when loading more for created sessions', fakeAsync(() => {
      component.isMentor = true;
      component.createdSessions = { data: [{ id: 1 }] };
      mockSessionService.getAllSessionsAPI.and.returnValue(
        Promise.resolve({ data: [{ id: 2 }], count: 2 })
      );
      
      component.loadSegmentData('created-sessions', true);
      tick();
      
      expect(component.createdSessions.data.length).toBe(2);
      expect(component.createdSessions.data).toEqual([{ id: 1 }, { id: 2 }]);
    }));

        it('should append data when loading more for enrolled sessions', fakeAsync(() => {
      component.sessions = { my_sessions: [{ id: 1 }] };
      mockSessionService.getSessions.and.returnValue(
        Promise.resolve({ result: { my_sessions: [{ id: 2 }], my_sessions_count: 2 } })
      );
      
      component.loadSegmentData('my-sessions', true);
      tick();
      
      expect(component.sessions.my_sessions.length).toBe(2);
      expect(component.sessions.my_sessions).toEqual([{ id: 1 }, { id: 2 }]);
    }));


    describe('eventAction', () => {
          beforeEach(() => {
      component.user = mockUser;
      mockSessionService.joinSession.and.returnValue(Promise.resolve());
      mockSessionService.enrollSession.and.returnValue(
        Promise.resolve({ result: true, message: 'Success' })
      );
      mockSessionService.startSession.and.returnValue(Promise.resolve(false));
      mockSessionService.getSessions.and.returnValue(Promise.resolve(mockSessions));
    });

        it('should navigate to session details on cardSelect', fakeAsync(() => {
      component.eventAction({ type: 'cardSelect', data: { id: 123 } });
      tick();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.SESSIONS_DETAILS}/123`]);
    }));

        it('should join session on joinAction', fakeAsync(() => {
      const mockSession = { id: 123 };
      
      component.eventAction({ type: 'joinAction', data: mockSession });
      tick();
      
      expect(mockSessionService.joinSession).toHaveBeenCalledWith(mockSession);
      expect(component.page).toBe(1);
    }));

      it('should enroll in session on enrollAction', fakeAsync(() => {
      component.eventAction({ type: 'enrollAction', data: { id: 123 } });
      tick();
      
      expect(mockSessionService.enrollSession).toHaveBeenCalledWith(123);
      expect(mockToast.showToast).toHaveBeenCalledWith('Success', 'success');
      expect(component.page).toBe(1);
    }));


 it('should show profile popup if user has no about', fakeAsync(() => {
    environment['isAuthBypassed'] = false;  // <-- Set to false
    component.user = { ...mockUser, about: null };
    
    component.eventAction({ type: 'cardSelect', data: { id: 123 } });
    tick();
    
    expect(mockProfileService.upDateProfilePopup).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));
    
    })

    describe('search', () => {
      it('should navigate to search page with valid search text', () => {
      component.criteriaChip = { name: 'title', label: 'Title' };
      
      component.search('test search');
      
      expect(component.isOpen).toBe(false);
      expect(mockUtilService.subscribeSearchText).toHaveBeenCalledWith('test search');
      expect(mockUtilService.subscribeCriteriaChip).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.HOME_SEARCH}`], {
        queryParams: { search: 'test search', chip: 'title' }
      });
    });
      it('should show toast for search text less than 3 characters', () => {
      component.search('ab');
      
      expect(mockToast.showToast).toHaveBeenCalledWith('ENTER_MIN_CHARACTER', 'danger');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle empty search text', () => {
      component.search('');
      
      expect(mockToast.showToast).toHaveBeenCalledWith('ENTER_MIN_CHARACTER', 'danger');
    });

        it('should close overlay on valid search', () => {
      component.isOpen = true;
      
      component.search('test search');
      
      expect(component.isOpen).toBe(false);
    });

    describe('segmentChanged', () => {
      beforeEach(() => {
        mockSessionService.getSessions.and.returnValue(Promise.resolve(mockSessions));
            mockSessionService.getAllSessionsAPI.and.returnValue(Promise.resolve(mockCreatedSessions));
                it('should change selected segment and reset page', fakeAsync(() => {
                  component.page = 5;
                  
                  component.segmentChanged({ name: 'created-sessions' });
                  tick();
                  
                  expect(component.selectedSegment).toBe('created-sessions');
                  expect(component.page).toBe(1);
                }));

          it('should load data for all-sessions segment', fakeAsync(() => {
          component.segmentChanged({ name: 'all-sessions' });
          tick();
          
          expect(mockSessionService.getSessions).toHaveBeenCalled();
        }));

            it('should load data for my-sessions segment', fakeAsync(() => {
      component.segmentChanged({ name: 'my-sessions' });
      tick();
      
      expect(mockSessionService.getSessions).toHaveBeenCalled();
    }));
      })
    });


    describe('createSession', ()=> {
    it('should navigate to create session page if user has about', () => {
      component.user = mockUser;
      
      component.createSession();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([`${CommonRoutes.CREATE_SESSION}`], {
        queryParams: { source: 'home' }
      });
    });

      it('should show profile popup if user has no about', () => {
      component.user = { ...mockUser, about: null };
      
      component.createSession();
      
      expect(mockProfileService.upDateProfilePopup).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    
    })
    
    })
  });
});