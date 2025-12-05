
import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MentorSearchDirectoryPage } from './mentor-search-directory.page';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { MatPaginator } from '@angular/material/paginator';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { UtilService } from 'src/app/core/services';
import { ToastService } from 'src/app/core/services';
import { LocalStorageService } from 'src/app/core/services';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { CommonRoutes } from 'src/global.routes';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MentorSearchDirectoryPage', () => {
  let component: MentorSearchDirectoryPage;
  let fixture: ComponentFixture<MentorSearchDirectoryPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockFormService: jasmine.SpyObj<FormService>;
  let mockUtilService: jasmine.SpyObj<UtilService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;

  const mockButtonConfig = [
    { label: 'Chat', action: 'chat', isHide: false },
    { label: 'Request Session', action: 'requestSession', isHide: false }
  ];

  const mockMentorForm = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'expertise', label: 'Expertise', type: 'select' }
  ];

  const mockMentorsData = {
    result: {
      data: [
        { id: '1', name: 'Mentor 1', expertise: 'Angular' },
        { id: '2', name: 'Mentor 2', expertise: 'React' }
      ],
      count: 2
    }
  };

  const mockFilterData = [
    {
      name: 'expertise',
      label: 'Expertise',
      options: [
        { label: 'Angular', value: 'angular', selected: false },
        { label: 'React', value: 'react', selected: false }
      ]
    }
  ];

  const mockPlatformConfig = {
    result: {
      search_config: {
        search: {
          mentor: {
            fields: [
              { name: 'name', label: 'Name' },
              { name: 'expertise', label: 'Expertise' }
            ]
          }
        }
      }
    }
  };

  beforeEach(waitForAsync(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      data: of({ button_config: mockButtonConfig }),
      snapshot: {
        queryParams: {}
      }
    };
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['getMentors']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['getPlatformConfig']);
    mockFormService = jasmine.createSpyObj('FormService', ['getForm', 'filterList']);
    mockUtilService = jasmine.createSpyObj('UtilService', ['transformToFilterData']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);

    TestBed.configureTestingModule({
      declarations: [MentorSearchDirectoryPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ModalController, useValue: mockModalController },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: FormService, useValue: mockFormService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: ToastService, useValue: mockToastService },
        { provide: LocalStorageService, useValue: mockLocalStorageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MentorSearchDirectoryPage);
    component = fixture.componentInstance;
    
    // Initialize searchAndCriterias to prevent undefined errors
    component.searchAndCriterias = {
      headerData: {
        searchText: '',
        criterias: {
          name: undefined,
          label: undefined
        }
      }
    };
  }));

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.page).toBe(1);
      expect(component.isOpen).toBe(false);
      expect(component.overlayChips).toEqual([]);
      expect(component.chips).toEqual([]);
    });

    it('should set button config from route data on ngOnInit', () => {
      component.ngOnInit();
      expect(component.buttonConfig).toEqual(mockButtonConfig);
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ id: 'user123' }));
      mockFormService.getForm.and.returnValue(Promise.resolve({ data: { fields: { controls: mockMentorForm } } }));
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      mockPermissionService.getPlatformConfig.and.returnValue(Promise.resolve(mockPlatformConfig));
      mockFormService.filterList.and.returnValue(Promise.resolve(mockFilterData));
      mockUtilService.transformToFilterData.and.returnValue(Promise.resolve(mockFilterData));
    });

    it('should load user details and set currentUserId', async () => {
      await component.ionViewWillEnter();
      expect(mockLocalStorageService.getLocalData).toHaveBeenCalled();
      expect(component.currentUserId).toBe('user123');
    });

    it('should load mentor form', async () => {
      await component.ionViewWillEnter();
      expect(mockFormService.getForm).toHaveBeenCalled();
      expect(component.mentorForm).toEqual(mockMentorForm);
    });

    it('should handle search query param', async () => {
      mockActivatedRoute.snapshot.queryParams = { search: 'test search' };
      await component.ionViewWillEnter();
      expect(component.searchAndCriterias.headerData.searchText).toBe('test search');
    });

    it('should handle chip query param with matching field', async () => {
      mockActivatedRoute.snapshot.queryParams = { search: 'test', chip: 'name' };
      await component.ionViewWillEnter();
      expect(component.searchAndCriterias.headerData.criterias.name).toBe('name');
      expect(component.searchAndCriterias.headerData.criterias.label).toBe('Name');
    });

    it('should load platform config and overlay chips', async () => {
      await component.ionViewWillEnter();
      expect(mockPermissionService.getPlatformConfig).toHaveBeenCalled();
      expect(component.overlayChips).toEqual(mockPlatformConfig.result.search_config.search.mentor.fields);
    });

    it('should load filter data', async () => {
      await component.ionViewWillEnter();
      expect(mockFormService.filterList).toHaveBeenCalledWith({ filterType: 'mentor', org: true });
      expect(mockUtilService.transformToFilterData).toHaveBeenCalled();
      expect(component.filterData).toEqual(mockFilterData);
    });

    it('should call getMentors', async () => {
      await component.ionViewWillEnter();
      expect(mockProfileService.getMentors).toHaveBeenCalled();
    });
  });

  describe('onSearch', () => {
    beforeEach(() => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
    });

    it('should update search criteria and navigate with query params', async () => {
      const event = {
        searchText: 'angular',
        criterias: { name: 'expertise', label: 'Expertise' }
      };
      
      await component.onSearch(event);
      
      expect(component.searchAndCriterias.headerData).toEqual(event);
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { search: 'angular', chip: 'expertise' },
        queryParamsHandling: 'merge'
      });
      expect(mockProfileService.getMentors).toHaveBeenCalled();
    });

    it('should handle search without criteria', async () => {
      const event = {
        searchText: 'test search',
        criterias: undefined
      };
      
      await component.onSearch(event);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { search: 'test search', chip: undefined },
        queryParamsHandling: 'merge'
      });
    });
  });

  describe('onClearSearch', () => {
    beforeEach(() => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      component.searchAndCriterias.headerData.searchText = 'test';
      component.searchAndCriterias.headerData.criterias = { name: 'test', label: 'Test' };
    });

    it('should clear search text and criteria', async () => {
      await component.onClearSearch('');
      
      expect(component.searchAndCriterias.headerData.searchText).toBe('');
      expect(component.searchAndCriterias.headerData.criterias).toBeUndefined();
    });

    it('should navigate with empty query params', async () => {
      await component.onClearSearch('');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { search: '', chip: '' },
        queryParamsHandling: 'merge'
      });
    });

    it('should call getMentors', async () => {
      await component.onClearSearch('');
      expect(mockProfileService.getMentors).toHaveBeenCalled();
    });
  });

  describe('onClickFilter', () => {
    let mockModal: any;

    beforeEach(() => {
      mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ data: {} })
        )
      };
      mockModalController.create.and.returnValue(Promise.resolve(mockModal));
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      component.filterData = mockFilterData;
    });

    it('should open filter modal', async () => {
      await component.onClickFilter();
      
      expect(mockModalController.create).toHaveBeenCalledWith({
        component: FilterPopupComponent,
        cssClass: 'filter-modal',
        componentProps: { filterData: component.filterData }
      });
      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should handle modal dismissal with role closed', async () => {
      mockModal.onDidDismiss.and.returnValue(
        Promise.resolve({ data: { role: 'closed', data: mockFilterData } })
      );
      
      await component.onClickFilter();
      
      expect(component.filterData).toEqual(mockFilterData);
    });

    it('should handle empty filter data on dismissal', async () => {
      mockModal.onDidDismiss.and.returnValue(Promise.resolve({ data: {} }));
      component.chips = ['test'];
      component.urlQueryData = 'test=value';
      
      await component.onClickFilter();
      
      expect(component.chips).toEqual([]);
      expect(component.filteredDatas).toEqual([]);
      expect(component.urlQueryData).toBeNull();
    });

    it('should process selected filters', async () => {
      const selectedFilters = {
        expertise: [
          { label: 'Angular', value: 'angular' },
          { label: 'React', value: 'react' }
        ]
      };
      mockModal.onDidDismiss.and.returnValue(
        Promise.resolve({ data: { data: { selectedFilters } } })
      );
      
      await component.onClickFilter();
      
      expect(component.filteredDatas['expertise']).toBe('angular,react');
      expect(component.selectedChips).toBe(true);
      expect(component.page).toBe(1);
      expect(component.setPaginatorToFirstpage).toBe(true);
    });
  });

  describe('extractLabels', () => {
    it('should extract labels from filter data', () => {
      const data = {
        expertise: [{ label: 'Angular', value: 'angular' }],
        experience: [{ label: '5+ years', value: '5+' }]
      };
      
      component.extractLabels(data);
      
      expect(component.chips.length).toBe(2);
      expect(component.chips).toContain(data.expertise[0]);
      expect(component.chips).toContain(data.experience[0]);
    });

    it('should clear existing chips before extracting', () => {
      component.chips = ['old chip'];
      const data = {
        expertise: [{ label: 'Angular', value: 'angular' }]
      };
      
      component.extractLabels(data);
      
      expect(component.chips.length).toBe(1);
      expect(component.chips[0]).toEqual(data.expertise[0]);
    });
  });

  describe('getUrlQueryData', () => {
    it('should generate query string from filtered data', () => {
      component.filteredDatas = {} as any;
      component.filteredDatas['expertise'] = 'angular,react';
      component.filteredDatas['experience'] = '5+';
      
      component.getUrlQueryData();
      
      expect(component.urlQueryData).toBe('expertise=angular,react&experience=5+');
    });

    it('should handle single filter', () => {
      component.filteredDatas = {} as any;
      component.filteredDatas['expertise'] = 'angular';
      
      component.getUrlQueryData();
      
      expect(component.urlQueryData).toBe('expertise=angular');
    });
  });

  describe('eventAction', () => {
    it('should navigate to mentor details on cardSelect', () => {
      const event = { type: 'cardSelect', data: { id: '123' } };
      
      component.eventAction(event);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, '123']);
    });

    it('should navigate to chat on chat event', () => {
      const event = { type: 'chat', data: { id: '123' } };
      
      component.eventAction(event);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT_REQ, event.data]);
    });

    it('should navigate to session request on requestSession event', () => {
      const event = { type: 'requestSession', data: { id: '123' } };
      
      component.eventAction(event);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [CommonRoutes.SESSION_REQUEST],
        { queryParams: { data: event.data } }
      );
    });
  });

  describe('eventHandler', () => {
    it('should update valueFromChipAndFilter and reset criterias', () => {
      component.searchAndCriterias.headerData.criterias = { name: 'test', label: 'Test' };
      
      component.eventHandler('some value');
      
      expect(component.valueFromChipAndFilter).toBe('some value');
      expect(component.searchAndCriterias.headerData.criterias).toEqual({
        name: undefined,
        label: undefined
      });
    });
  });

  describe('onPageChange', () => {
    beforeEach(() => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      component.paginator = { pageSize: 10 } as MatPaginator;
    });

    it('should update page and pageSize', () => {
      const event = { pageIndex: 2, pageSize: 20 };
      
      component.onPageChange(event);
      
      expect(component.page).toBe(3);
      expect(component.pageSize).toBe(10);
    });

    it('should call getMentors', () => {
      const event = { pageIndex: 1, pageSize: 10 };
      
      component.onPageChange(event);
      
      expect(mockProfileService.getMentors).toHaveBeenCalled();
    });
  });

  describe('removeFilteredData', () => {
    beforeEach(() => {
      component.filterData = [
        {
          name: 'expertise',
          options: [
            { label: 'Angular', value: 'angular', selected: true },
            { label: 'React', value: 'react', selected: false }
          ]
        }
      ];
      component.filteredDatas = {} as any;
      component.filteredDatas['expertise'] = 'angular,react';
    });

    it('should remove chip from filterData', () => {
      component.removeFilteredData('angular');
      
      const angularOption = component.filterData[0].options.find(opt => opt.value === 'angular');
      expect(angularOption.selected).toBe(false);
    });

    it('should remove chip from filteredDatas', () => {
      component.removeFilteredData('angular');
      
      expect(component.filteredDatas['expertise']).toBe('react');
    });

    it('should delete key if no values remain', () => {
      component.filteredDatas = {} as any;
      component.filteredDatas['expertise'] = 'angular';
      
      component.removeFilteredData('angular');
      
      expect(component.filteredDatas['expertise']).toBeUndefined();
    });
  });

  describe('getMentors', () => {
    beforeEach(() => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ id: 'user123' }));
      component.currentUserId = 'user123';
      component.buttonConfig = JSON.parse(JSON.stringify(mockButtonConfig)); // Deep clone
      component.filteredDatas = {} as any;
    });

    it('should fetch mentors with correct parameters', async () => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      component.page = 2;
      component.pageSize = 10;
      component.searchAndCriterias.headerData.searchText = 'angular';
      component.searchAndCriterias.headerData.criterias = { name: 'expertise' };
      component.urlQueryData = 'experience=5+';
      
      await component.getMentors();
      
      expect(mockProfileService.getMentors).toHaveBeenCalledWith(true, {
        page: 2,
        pageSize: 10,
        searchText: 'angular',
        selectedChip: 'expertise',
        urlQueryData: 'experience=5+'
      });
    });

    it('should set data and totalCount on success', async () => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      
      await component.getMentors();
      
      expect(component.data).toEqual(mockMentorsData.result.data);
      expect(component.totalCount).toBe(2);
      expect(component.isOpen).toBe(false);
    });

    it('should hide buttons for current user', async () => {
      const mentorsWithCurrentUser = {
        result: {
          data: [
            { id: 'user123', name: 'Current User', buttonConfig: undefined },
            { id: '2', name: 'Other Mentor', buttonConfig: undefined }
          ],
          count: 2
        }
      };
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mentorsWithCurrentUser));
      
      await component.getMentors();
      
      expect(component.data[0].buttonConfig).toBeDefined();
      expect(component.data[0].buttonConfig[0].isHide).toBe(true);
      expect(component.data[1].buttonConfig[0].isHide).toBe(false);
    });

    it('should handle empty results', async () => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve({ result: { data: [], count: 0 } }));
      component.searchAndCriterias.headerData.searchText = '';
      component.searchAndCriterias.headerData.criterias = undefined;
      
      await component.getMentors();
      
      expect(component.data).toEqual([]);
      expect(component.totalCount).toEqual([]);
    });

    it('should set filterIcon based on search text', async () => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      component.searchAndCriterias.headerData.searchText = 'test';
      component.searchAndCriterias.headerData.criterias = undefined;
      
      await component.getMentors();
      
      expect(component.filterIcon).toBe(true);
    });

    it('should trim search text before passing to service', async () => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      component.searchAndCriterias.headerData.searchText = '  angular  ';
      component.searchAndCriterias.headerData.criterias = undefined;
      
      await component.getMentors();
      
      const callArgs = mockProfileService.getMentors.calls.mostRecent().args[1];
      expect(callArgs.searchText).toBe('angular');
    });
  });

  describe('removeChip', () => {
    beforeEach(() => {
      mockProfileService.getMentors.and.returnValue(Promise.resolve(mockMentorsData));
      component.chips = [
        { label: 'Angular', value: 'angular' },
        { label: 'React', value: 'react' }
      ];
      component.filteredDatas = {} as any;
      component.filteredDatas['expertise'] = 'angular,react';
      spyOn(component, 'removeFilteredData');
      spyOn(component, 'getUrlQueryData');
    });

    it('should remove chip at specified index', () => {
      const event = { index: 0, chipValue: 'angular' };
      
      component.removeChip(event);
      
      expect(component.chips.length).toBe(1);
      expect(component.chips[0].value).toBe('react');
    });

    it('should call removeFilteredData with chip value', () => {
      const event = { index: 0, chipValue: 'angular' };
      
      component.removeChip(event);
      
      expect(component.removeFilteredData).toHaveBeenCalledWith('angular');
    });

    it('should update URL query data and fetch mentors', () => {
      const event = { index: 0, chipValue: 'angular' };
      
      component.removeChip(event);
      
      expect(component.getUrlQueryData).toHaveBeenCalled();
      expect(mockProfileService.getMentors).toHaveBeenCalled();
    });
  });

  describe('ionViewDidLeave', () => {
    beforeEach(() => {
      component.searchAndCriterias.headerData.searchText = 'test';
      component.searchAndCriterias.headerData.criterias = { name: 'test' };
      component.filterIcon = true;
      component.chips = ['test'];
      component.urlQueryData = 'test=value';
    });

    it('should reset all component state', () => {
      component.ionViewDidLeave();
      
      expect(component.searchAndCriterias.headerData.searchText).toBe('');
      expect(component.searchAndCriterias.headerData.criterias.name).toBeUndefined();
      expect(component.filterIcon).toBe(false);
      expect(component.chips).toEqual([]);
      expect(component.urlQueryData).toBeNull();
    });
  });
});
