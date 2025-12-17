import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { HttpService } from './http.service';
import { UserService } from '../user/user.service';
import { NetworkService } from '../network.service';
import { ToastService } from '../toast.service';
import { LoaderService } from '../loader/loader.service';
import { LocalStorageService } from '../localstorage.service';
import { AuthService } from '../auth/auth.service';
import { urlConstants } from '../../constants/urlConstants';

describe('HttpService', () => {
  let service: HttpService;
  let userService: jasmine.SpyObj<UserService>;
  let network: jasmine.SpyObj<NetworkService>;
  let toast: jasmine.SpyObj<ToastService>;
  let loader: jasmine.SpyObj<LoaderService>;
  let localStorageSvc: jasmine.SpyObj<LocalStorageService>;
  let auth: jasmine.SpyObj<AuthService>;
  let modalCtrl: jasmine.SpyObj<ModalController>;
  let alertCtrl: jasmine.SpyObj<AlertController>;
  let translate: jasmine.SpyObj<TranslateService>;
  let router: jasmine.SpyObj<Router>;
  let injector: jasmine.SpyObj<Injector>;

  const baseUrl = 'https://test-api.com';
  const token = 'test-token';

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', ['getUserValue'], {
      token: { refresh_token: 'refresh' },
    });
    network = jasmine.createSpyObj('NetworkService', ['getCurrentStatus'], {
      isNetworkAvailable: true,
    });
    toast = jasmine.createSpyObj('ToastService', ['showToast', 'setDisableToast']);
    loader = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    localStorageSvc = jasmine.createSpyObj('LocalStorageService', ['getLocalData', 'setLocalData']);
    auth = jasmine.createSpyObj('AuthService', ['logoutAccount', 'clearLocalData']);
    modalCtrl = jasmine.createSpyObj('ModalController', ['create', 'getTop', 'dismiss']);
    alertCtrl = jasmine.createSpyObj('AlertController', ['create']);
    translate = jasmine.createSpyObj('TranslateService', ['get']);
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    injector = jasmine.createSpyObj('Injector', ['get']);

    TestBed.configureTestingModule({
      providers: [
        HttpService,
        { provide: UserService, useValue: userService },
        { provide: NetworkService, useValue: network },
        { provide: ToastService, useValue: toast },
        { provide: LoaderService, useValue: loader },
        { provide: LocalStorageService, useValue: localStorageSvc },
        { provide: AuthService, useValue: auth },
        { provide: ModalController, useValue: modalCtrl },
        { provide: AlertController, useValue: alertCtrl },
        { provide: TranslateService, useValue: translate },
        { provide: Router, useValue: router },
        { provide: Injector, useValue: injector },
      ],
    });

    service = TestBed.inject(HttpService);
    service.baseUrl = baseUrl;

    userService.getUserValue.and.returnValue(Promise.resolve(token));
    network.getCurrentStatus.and.returnValue(Promise.resolve());
    localStorageSvc.getLocalData.and.returnValue(Promise.resolve('en'));
    injector.get.and.returnValue(auth);
    translate.get.and.returnValue(of({ OK: 'OK' }));

    spyOn(Storage.prototype, 'getItem').and.returnValue(null);

    // Replace internal httpClient with a spy-able object
    (service as any).httpClient = {
      post: jasmine.createSpy('post'),
      get: jasmine.createSpy('get'),
      delete: jasmine.createSpy('delete'),
      patch: jasmine.createSpy('patch'),
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setHeaders', () => {
    it('returns headers when token exists', async () => {
      const headers = await service.setHeaders();
      expect(headers).toBeTruthy();
      expect(headers!['X-auth-token']).toBe(token);
      expect(headers!['Content-Type']).toBe('application/json');
    });

    it('returns null when no token', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(null));
      const headers = await service.setHeaders();
      expect(headers).toBeNull();
    });
  });

  describe('getToken', () => {
    it('returns token when user service has value', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(token));
      const res = await service.getToken();
      expect(res).toBe(token);
    });

    it('returns null when user service has no value', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(null));
      const res = await service.getToken();
      expect(res).toBeNull();
    });
  });

  describe('checkNetworkAvailability', () => {
    it('returns true when network available', async () => {
      network.isNetworkAvailable = true;
      const res = await service.checkNetworkAvailability();
      expect(res).toBeTrue();
      expect(network.getCurrentStatus).toHaveBeenCalled();
    });

    it('returns false and shows toast when network unavailable', async () => {
      // Force the spy object property to false
      Object.defineProperty(network, 'isNetworkAvailable', { value: false, writable: true });

      const res = await service.checkNetworkAvailability();

      expect(res).toBeFalse();
      expect(toast.showToast).toHaveBeenCalledWith('MSG_PLEASE_NETWORK', 'danger');
    });
  });

  describe('post', () => {
    const req = { url: '/test', payload: { a: 1 } };

    it('throws when network unavailable', async () => {
      network.isNetworkAvailable = false;
      await expectAsync(service.post(req as any)).toBeRejected();
    });

    it('returns data on OK', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + req.url,
        data: { responseCode: 'OK', result: { success: true } },
      };
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve(httpRes as any)
      );

      const res = await service.post(req as any);

      expect(res.responseCode).toBe('OK');
      expect((service as any).httpClient.post).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    const req = { url: '/test-get' };

    it('throws when network unavailable', async () => {
      network.isNetworkAvailable = false;
      await expectAsync(service.get(req as any)).toBeRejected();
    });

    it('returns data on OK and does not open modal when no meta', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + req.url,
        data: { responseCode: 'OK' },
      };
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve(httpRes as any)
      );

      const res = await service.get(req as any);

      expect(res.responseCode).toBe('OK');
      expect(modalCtrl.create).not.toHaveBeenCalled();
    });

    it('opens feedback modal when meta data present and not yet triggered', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + req.url,
        data: {
          responseCode: 'OK',
          meta: { data: [{ id: 'fb1' }] },
        },
      };
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onWillDismiss: jasmine
          .createSpy('onWillDismiss')
          .and.returnValue(Promise.resolve({ data: true }) as any),
      };
      modalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve(httpRes as any)
      );

      service.isFeedbackTriggered = false;
      await service.get(req as any);

      expect(modalCtrl.create).toHaveBeenCalled();
      expect(service.isFeedbackTriggered).toBeTrue();
    });
  });

  describe('delete', () => {
    const req = { url: '/test-delete' };

    it('throws when network unavailable', async () => {
      network.isNetworkAvailable = false;
      await expectAsync(service.delete(req as any)).toBeRejected();
    });

    it('returns data on OK', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + req.url,
        data: { responseCode: 'OK', result: { removed: true } },
      };
      (service as any).httpClient.delete.and.returnValue(
        Promise.resolve(httpRes as any)
      );

      const res = await service.delete(req as any);
      expect(res.responseCode).toBe('OK');
      expect((service as any).httpClient.delete).toHaveBeenCalled();
    });
  });

  describe('patch', () => {
    const req = { url: '/test-patch', payload: { x: 1 } };

    it('throws when network unavailable', async () => {
      network.isNetworkAvailable = false;
      await expectAsync(service.patch(req as any)).toBeRejected();
    });

    it('returns data on OK', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + req.url,
        data: { responseCode: 'OK', result: { updated: true } },
      };
      (service as any).httpClient.patch.and.returnValue(
        Promise.resolve(httpRes as any)
      );

      const res = await service.patch(req as any);
      expect(res.responseCode).toBe('OK');
      expect((service as any).httpClient.patch).toHaveBeenCalled();
    });
  });

  describe('getFile', () => {
    const req = { url: '/file' };

    it('returns data when status is 200', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + req.url,
        data: { file: 'content' },
      };
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve(httpRes as any)
      );

      const res = await service.getFile(req as any);
      expect(res.status).toBe(200);
      expect((service as any).httpClient.get).toHaveBeenCalled();
    });
  });

  describe('getAccessToken', () => {
    it('calls refresh token endpoint and returns result', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + urlConstants.API_URLS.REFRESH_TOKEN,
        data: {
          responseCode: 'OK',
          result: { access_token: 'new-token' },
        },
      };
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve(httpRes as any)
      );

      const res = await service.getAccessToken();

      expect(res.access_token).toBe('new-token');
      const callArgs = (service as any).httpClient.post.calls.mostRecent().args[0];
      expect(callArgs.url).toContain(urlConstants.API_URLS.REFRESH_TOKEN);
    });
  });

  describe('handleError', () => {
    it('redirects on 401 non-Congratulations', () => {
      const result = {
        status: 401,
        data: { message: 'Unauthorized' },
        url: baseUrl + '/test',
      };

      expect(() => service.handleError(result as any)).toThrow();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('triggers logout confirmation on 401 Congratulations', () => {
      const result = {
        status: 401,
        data: { message: 'Congratulations! done' },
        url: baseUrl + '/test',
      };
      spyOn(service, 'triggerLogoutConfirmationAlert').and.returnValue(Promise.resolve(false) as any);

      expect(() => service.handleError(result as any)).toThrow();
      expect(service.triggerLogoutConfirmationAlert).toHaveBeenCalledWith(result as any);
    });

    it('shows toast for 400 with message', () => {
      const result = {
        status: 400,
        data: { message: 'Bad Request' },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith('Bad Request', 'danger');
    });

    it('shows default toast when message missing', () => {
      const result = {
        status: 400,
        data: { message: null },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith(
        'SOMETHING_WENT_WRONG',
        'danger'
      );
    });
  });

  describe('triggerLogoutConfirmationAlert', () => {
    it('shows alert and returns false when closed with cancel', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'cancel' }) as any
        ),
      };
      alertCtrl.create.and.returnValue(Promise.resolve(mockAlert as any));
      modalCtrl.getTop.and.returnValue(Promise.resolve(null));

      const res = await service.triggerLogoutConfirmationAlert({
        data: { message: 'msg' },
      } as any);

      expect(res).toBeFalse();
      expect(alertCtrl.create).toHaveBeenCalled();
      expect(mockAlert.present).toHaveBeenCalled();
    });
  });
});


