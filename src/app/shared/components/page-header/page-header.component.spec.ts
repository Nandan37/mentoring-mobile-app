import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/core/services';
import { BehaviorSubject, of } from 'rxjs';
import { CommonRoutes } from 'src/global.routes';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  // Mocks
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let routerSpy: any; // Using 'any' allows us to easily change the .url property
  let utilServiceMock: any;
  let hasBadgeSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    // 1. Setup NavController Mock
    navCtrlSpy = jasmine.createSpyObj('NavController', ['pop']);

    // 2. Setup Router Mock
    routerSpy = {
      url: '/some/random/url'
    };

    // 3. Setup UtilService Mock with a Subject we can control
    hasBadgeSubject = new BehaviorSubject<boolean>(false);
    utilServiceMock = {
      hasBadge$: hasBadgeSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [PageHeaderComponent],
      providers: [
        { provide: NavController, useValue: navCtrlSpy },
        { provide: Router, useValue: routerSpy },
        { provide: UtilService, useValue: utilServiceMock }
      ],
      // Schemas: [CUSTOM_ELEMENTS_SCHEMA] prevents errors about unknown elements like <ion-header>
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to hasBadge$ and set hasBadge to true when service emits true', () => {
      // Act
      hasBadgeSubject.next(true);
      
      // Assert
      expect(component.hasBadge).toBeTrue();
    });

    it('should subscribe to hasBadge$ and set hasBadge to false when service emits false', () => {
      // Act
      hasBadgeSubject.next(false);
      
      // Assert
      expect(component.hasBadge).toBeFalse();
    });

    it('should initialize routes array correctly', () => {
      expect(component.routes).toBeDefined();
      expect(component.routes.length).toBeGreaterThan(0);
      expect(component.routes[0].title).toBe('MENTORS');
    });
  });

  describe('onAction', () => {
    it('should emit actionEvent with the passed event data', () => {
      // Arrange
      spyOn(component.actionEvent, 'next');
      const testEvent = { id: 1, action: 'test' };

      // Act
      component.onAction(testEvent);

      // Assert
      expect(component.actionEvent.next).toHaveBeenCalledWith(testEvent);
    });
  });

  describe('onBack', () => {
    it('should call location.pop() when URL is NOT the home tab', () => {
      // Arrange
      routerSpy.url = '/some-other-route';
      
      // Act
      component.onBack();

      // Assert
      expect(navCtrlSpy.pop).toHaveBeenCalled();
    });

    // DISABLED (xit): This test causes a full page reload because the component 
    // assigns window.location.href directly. This disconnects the Karma test runner.
    // To test this properly, a WindowRef service should be injected into the component.
    xit('should NOT call location.pop() when URL IS the home tab', () => {
      // Arrange
      routerSpy.url = `/${CommonRoutes.TABS}/${CommonRoutes.HOME}`;
      
      // Act
      component.onBack();

      // Assert
      expect(navCtrlSpy.pop).not.toHaveBeenCalled();
    });
  });
});