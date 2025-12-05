import 'zone.js';          
import 'zone.js/testing';  

/* generic-profile-header.component.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GenericProfileHeaderComponent } from './generic-profile-header.component';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';
import { LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { TranslateService } from '@ngx-translate/core';
import { CommonRoutes } from 'src/global.routes';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { environment } from 'src/environments/environment';

// create spies/mocks
const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
const mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
const mockProfileService = jasmine.createSpyObj('ProfileService', ['upDateProfilePopup', 'viewRolesModal']);
const mockUtilService = jasmine.createSpyObj('UtilService', ['isMobile', 'getDeepLink', 'shareLink']);
const mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
const mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);

describe('GenericProfileHeaderComponent', () => {
  let component: GenericProfileHeaderComponent;
  let fixture: ComponentFixture<GenericProfileHeaderComponent>;

  beforeEach(waitForAsync(async () => {
    // default behaviours for mocks
    mockUtilService.isMobile.and.returnValue(false); // default to non-mobile
    mockLocalStorage.getLocalData.and.returnValue(Promise.resolve('false'));
    mockTranslateService.get.and.returnValue(of({}));
    mockUtilService.getDeepLink.and.returnValue(Promise.resolve('https://deep.link/x'));
    mockUtilService.shareLink.and.returnValue(Promise.resolve());
    mockProfileService.upDateProfilePopup.and.returnValue(undefined);
    mockProfileService.viewRolesModal.and.returnValue(undefined);

    await TestBed.configureTestingModule({
      declarations: [GenericProfileHeaderComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: LocalStorageService, useValue: mockLocalStorage }, // important: mock the class token
        { provide: ProfileService, useValue: mockProfileService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: ToastService, useValue: mockToastService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericProfileHeaderComponent);
    component = fixture.componentInstance;

    // make headerData safe for lifecycle methods
    component.headerData = {
      id: 11,
      name: 'Test Mentor',
      organizations: [
        {
          roles: [
            { title: 'mentor' },
            { title: 'admin' }
          ]
        }
      ],
      connection_details: { room_id: 'rId' },
      is_connected: false,
      about: 'something'
    };

    // default buttonConfig meta used in share
    component.buttonConfig = { meta: { id: 'btn-meta-id' } };

    // ensure any previous router navigate call history is cleared
    mockRouter.navigate.calls.reset();
  }));

  afterEach(() => {
    // reset spies to avoid cross-test pollution
    mockRouter.navigate.calls.reset();
    mockLocalStorage.getLocalData.calls.reset();
    mockProfileService.upDateProfilePopup.calls.reset();
    mockProfileService.viewRolesModal.calls.reset();
    mockTranslateService.get.calls.reset();
    mockToastService.showToast.calls.reset();
    mockUtilService.getDeepLink.calls.reset();
    mockUtilService.shareLink.calls.reset();
  });

  it('should create and call utilService.isMobile in constructor', () => {
    // constructor has already run when component was created
    expect(component).toBeTruthy();
    expect(mockUtilService.isMobile).toHaveBeenCalled();
  });

  it('ngOnInit should read chatConfig and compute roles/isMentor', async () => {
    mockLocalStorage.getLocalData.and.returnValue(Promise.resolve('true'));
    component.headerData.organizations = [{ roles: [{ title: 'mentor' }] }];

    await component.ngOnInit();

    expect(mockLocalStorage.getLocalData).toHaveBeenCalledWith(localKeys['CHAT_CONFIG']);

    // primary assertions
    expect(component.chatConfig).toBe('true');
    expect(component.roles.length).toBeGreaterThan(0);
    expect(component.isMentor).toBeTruthy();
  });

  it('action("edit") should navigate to EDIT_PROFILE with replaceUrl true', async () => {
    mockRouter.navigate.calls.reset();
    await component.action('edit');
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.EDIT_PROFILE}`], { replaceUrl: true });
  });

  it('action("role") should navigate to MENTOR_QUESTIONNAIRE when about present', async () => {
    mockRouter.navigate.calls.reset();
    component.headerData.about = 'present';
    await component.action('role');
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
    expect(mockProfileService.upDateProfilePopup).not.toHaveBeenCalled();
  });

  it('action("role") should call profileService.upDateProfilePopup when about is null and auth not bypassed', async () => {
  // ensure environment doesn't bypass auth
  (environment as any).isAuthBypassed = false;

  // make sure about is null so the component chooses popup branch
  component.headerData.about = null;

  // reset spy history
  mockProfileService.upDateProfilePopup.calls.reset();
  mockRouter.navigate.calls.reset();

  await component.action('role');

  expect(mockProfileService.upDateProfilePopup).toHaveBeenCalled();
  // also ensure it did not navigate to questionnaire
  expect(mockRouter.navigate).not.toHaveBeenCalledWith([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
});

  it('action("share") non-mobile should copy to clipboard and show toast', async () => {
    // ensure non-mobile path
    mockUtilService.isMobile.and.returnValue(false);

    // stub Clipboard.write (Capacitor web implementation) to avoid DOM permission errors
    spyOn(Clipboard, 'write').and.returnValue(Promise.resolve());

    mockRouter.navigate.calls.reset();
    await component.action('share');

    expect(Clipboard.write).toHaveBeenCalled();
    expect(mockToastService.showToast).toHaveBeenCalledWith('PROFILE_LINK_COPIED', 'success');
  });

  it('action("share") mobile + navigator.share branch should call utilService.shareLink', async () => {
    // enable mobile
    mockUtilService.isMobile.and.returnValue(true);

    // ensure navigator.share exists and is stubbed — do NOT overwrite window.navigator; only set property
    (navigator as any).share = jasmine.createSpy('share').and.returnValue(Promise.resolve());

    mockRouter.navigate.calls.reset();
    await component.action('share');

    // when mobile & navigator.share present, we expect utilService.getDeepLink and shareLink to be used
    expect(mockUtilService.getDeepLink).toHaveBeenCalled();
    expect(mockUtilService.shareLink).toHaveBeenCalled();
  });

  it('action("requestSession") should navigate to session request with queryParams', async () => {
    mockRouter.navigate.calls.reset();
    await component.action('requestSession');
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.SESSION_REQUEST}`], { queryParams: { data: component.headerData.id } });
  });

  it('action("chat") should navigate to CHAT_REQ when not connected', async () => {
    mockRouter.navigate.calls.reset();
    component.headerData.is_connected = false;
    await component.action('chat');
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.CHAT_REQ}`, component.headerData.id]);
  });

  it('action("chat") should navigate to CHAT when connected', async () => {
    mockRouter.navigate.calls.reset();
    component.headerData.is_connected = true;
    component.headerData.connection_details = { room_id: 'rId' };
    await component.action('chat');
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.CHAT}`, component.headerData.connection_details.room_id], { queryParams: { id: component.headerData.id } });
  });

  it('translateText should call translateService.get and update labels', () => {
    const mapping = {
      CHECK_OUT_MENTOR: 'Check out mentor',
      PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS: 'Profile on Mentored - explore the sessions'
    };
    mockTranslateService.get.and.returnValue(of(mapping));

    component.labels = ['CHECK_OUT_MENTOR', 'PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS'];
    component.translateText();

    expect(mockTranslateService.get).toHaveBeenCalledWith(component.labels);
    // subscription runs synchronously for the stub above
    expect(component.labels).toContain('Check out mentor');
    expect(component.labels).toContain('Profile on Mentored - explore the sessions');
  });

  it('copyToClipBoard should call Clipboard.write and show toast', async () => {
    spyOn(Clipboard, 'write').and.returnValue(Promise.resolve());
    await component.copyToClipBoard('http://example.com');
    expect(Clipboard.write).toHaveBeenCalledWith({ string: 'http://example.com' });
    expect(mockToastService.showToast).toHaveBeenCalledWith('COPIED', 'success');
  });

  it('viewRoles should call profileService.viewRolesModal with titles array', async () => {
    mockProfileService.viewRolesModal.calls.reset();
    component.headerData.organizations = [{ roles: [{ title: 'mentor' }, { title: 'admin' }] }];
    await component.viewRoles();
    expect(mockProfileService.viewRolesModal).toHaveBeenCalledWith(['mentor', 'admin']);
  });
});
