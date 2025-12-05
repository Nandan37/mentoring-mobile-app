import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { SearchPopoverComponent } from './search-popover.component';
import { ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpService, LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';
import * as _ from 'lodash-es';

// Mock translate pipe so template compilation doesn't require real ngx-translate
@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
	transform(value: any) {
		return value ?? 'mock';
	}
}

describe('SearchPopoverComponent', () => {
	let component: SearchPopoverComponent;
	let fixture: ComponentFixture<SearchPopoverComponent>;

	// Spies
	let modalCtrlSpy: jasmine.SpyObj<ModalController>;
	let platformSpy: jasmine.SpyObj<Platform>;
	let translateSpy: jasmine.SpyObj<TranslateService>;
	let localStorageSpy: jasmine.SpyObj<LocalStorageService>;
	let utilSpy: jasmine.SpyObj<UtilService>;
	let httpSpy: jasmine.SpyObj<HttpService>;
	let formSpy: jasmine.SpyObj<FormService>;
	let toastSpy: jasmine.SpyObj<ToastService>;

	// common input used by many tests
	const baseInput = {
		control: {
			meta: {
				maxCount: 'MAX_COUNT_KEY',
				filters: {
					entity_types: [{ key: 'MENTOR' }],
					organizations: [{ isEnabled: true }],
					type: [{ isEnabled: true, key: 'isMentor' }]
				},
				filterType: 'SOME_FILTER',
				url: 'MENTOR_LIST_API'
			},
			id: 'session-1',
			name: 'mentors'
		},
		viewListMode: false,
		controlName: ''
	};

	beforeEach(waitForAsync(() => {
		// create spy objects
		modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'getTop', 'create']);
		platformSpy = jasmine.createSpyObj('Platform', ['backButton']);
		// make backButton.subscribeWithPriority available and return noop unsubscribe
		(platformSpy.backButton as any).subscribeWithPriority = jasmine.createSpy('subscribeWithPriority').and.returnValue(() => {});

		translateSpy = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
		translateSpy.get.and.returnValue(of('mock'));

		localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
		// default storage returns null unless overridden in tests
		localStorageSpy.getLocalData.and.returnValue(Promise.resolve(null));

		utilSpy = jasmine.createSpyObj('UtilService', ['isMobile', 'getFormatedFilterData']);
		utilSpy.isMobile.and.returnValue(false);
		utilSpy.getFormatedFilterData.and.callFake((f: any) => f);


		httpSpy = jasmine.createSpyObj('HttpService', ['get']);
		// default http get to return empty results; tests override when needed
		httpSpy.get.and.returnValue(Promise.resolve({ result: { count: 0, data: [] } }));

		formSpy = jasmine.createSpyObj('FormService', ['getForm']);
		formSpy.getForm.and.returnValue(Promise.resolve({ data: { fields: { controls: ['field1'] } } }));

		toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);

		TestBed.configureTestingModule({
			declarations: [SearchPopoverComponent, MockTranslatePipe],
			providers: [
				{ provide: ModalController, useValue: modalCtrlSpy },
				{ provide: Platform, useValue: platformSpy },
				{ provide: TranslateService, useValue: translateSpy },
				{ provide: LocalStorageService, useValue: localStorageSpy },
				{ provide: UtilService, useValue: utilSpy },
				{ provide: HttpService, useValue: httpSpy },
				{ provide: FormService, useValue: formSpy },
				{ provide: ToastService, useValue: toastSpy },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(SearchPopoverComponent);
		component = fixture.componentInstance;
	}));

	it('should create and wire back button in constructor', () => {
		// constructor already ran; ensure object created
		expect(component).toBeTruthy();
		expect(platformSpy.backButton.subscribeWithPriority).toHaveBeenCalled();
	});

	describe('ngOnInit - non viewListMode flow', () => {
		beforeEach(fakeAsync(() => {
			localStorageSpy.getLocalData.and.callFake((key: string) => {
				const k = (key || '').toString().toUpperCase();
				if (k.includes('MAX')) return Promise.resolve(3);
				if (k.includes('USER') && !k.includes('ROLE')) return Promise.resolve({ id: 'user-1' });
				if (k.includes('ROLE')) return Promise.resolve(['role1']);
				return Promise.resolve(null);
			});

			// Sample mentee list payload
			const menteePayload = {
				result: {
					count: 1,
					data: [{
						id: 'm1',
						name: 'Mentee 1',
						organization: { name: 'Org1' },
						enrolled_type: 'NOT_ENROLLED'
					}]
				}
			};

			// Ensure filter endpoint returns an iterable result (structured array),
			// and mentee-list endpoint returns menteePayload.
			httpSpy.get.and.callFake((config: any) => {
				const url = (config && config.url) ? config.url : '';
				// Adjust the substring check below if your real constants differ.
				if (url.includes('FILTER_LIST')) {
					// FIX: Return a structured filter array to ensure filterData is iterable upon assignment
					return Promise.resolve({ result: [{ name: 'role', options: [] }] });
				}
				// Otherwise treat as mentee list request
				return Promise.resolve(menteePayload);
			});

			// util.getFormatedFilterData should return an array (synchronously) to match service signature
			utilSpy.getFormatedFilterData.and.callFake((f: any) => f || []);

			// set input control and other flags
			component.data = _.cloneDeep(baseInput);
			component.data.control.meta.url = 'MENTOR_LIST_API';
			component.data.control.meta.maxCount = 'MAX_COUNT_KEY';

			// run ngOnInit
			component.ngOnInit();
			tick();
		}));


		it('should populate mentorForm, tableData and filterData', () => {
			expect(component.mentorForm).toBeDefined();
			expect(component.tableData).toBeDefined();
			expect(component.filterData).toBeDefined();
			// tableData should have transformed organization and action field assigned
			expect(component.tableData[0].organization).toBe('Org1');
			// since selectedList is empty, action should be ADD button set
			expect(component.tableData[0].action).toEqual(component.actionButtons.ADD);
		});
	});

	describe('ngOnInit - viewListMode flow', () => {
		beforeEach(fakeAsync(() => {
			component.data = _.cloneDeep(baseInput);
			component.data.viewListMode = true;
			// create selected data
			component.data.selectedData = [{
				id: 's1',
				name: 'Sel1',
				organization: { name: 'OrgSel' },
				type: 'ENROLLED'
			}];
			// local storage user
			localStorageSpy.getLocalData.and.callFake((key: string) => {
				if (key === 'USER_DETAILS') return Promise.resolve({ id: 'user-1' });
				return Promise.resolve(null);
			});

			// run ngOnInit
			component.ngOnInit();
			tick();
		}));

		it('should set tableData from selectedList and set filterData to empty', () => {
			expect(component.tableData).toBeDefined();
			expect(component.filterData).toEqual([]);
			expect(component.tableData[0].organization).toBe('OrgSel');
			// action should be REMOVE and disabled for ENROLLED type
			expect(component.tableData[0].action[0].label).toBe('REMOVE');
		});
	});

	describe('getFilters', () => {
		it('should build url and return data.result when http succeeds', fakeAsync(() => {
			const filtersResult = { result: ['f1', 'f2'] };
			httpSpy.get.and.returnValue(Promise.resolve(filtersResult));
			component.data = _.cloneDeep(baseInput);

			let res;
			component.getFilters().then((r: any) => res = r);
			tick();
			expect(httpSpy.get).toHaveBeenCalled();
			expect(res).toEqual(filtersResult.result);
		}));

		it('should return null when http fails', fakeAsync(() => {
			httpSpy.get.and.returnValue(Promise.reject('err'));
			component.data = _.cloneDeep(baseInput);

			let res;
			component.getFilters().then((r: any) => res = r);
			tick();
			expect(res).toBeNull();
		}));
	});

	describe('getMenteelist', () => {
		beforeEach(() => {
			component.data = _.cloneDeep(baseInput);

			// Make localStorage return a user object for any key that includes 'USER'
			localStorageSpy.getLocalData.and.callFake((key: string) => {
				const k = (key || '').toString().toUpperCase();
				if (k.includes('USER') && !k.includes('ROLE')) return Promise.resolve({ id: 'user-123' });
				if (k.includes('ROLE')) return Promise.resolve(['role1']);
				if (k.includes('MAX')) return Promise.resolve(3);
				return Promise.resolve(null);
			});
		});
		it('should return data array and set count/noDataMessage', fakeAsync(() => {
			const payload = {
				result: {
					count: 2,
					data: [
						{ id: 'a', organization: { name: 'OrgA' }, enrolled_type: 'ENROLLED' },
						{ id: 'b', organization: { name: 'OrgB' }, enrolled_type: 'NOT_ENROLLED' }
					]
				}
			};
			httpSpy.get.and.returnValue(Promise.resolve(payload));

			let res;
			component.getMenteelist().then((r: any) => res = r);
			tick();

			expect(component.count).toBe(2);
			expect(component.noDataMessage).toBe('THIS_SPACE_LOOKS_EMPTY'); // since searchText is empty by default
			expect(res.length).toBe(2);
			// ensure transformations: organization and action (for not selected)
			expect(res[0].organization).toBe('OrgA');
			expect(res[1].action).toEqual(component.actionButtons.ADD);
		}));

		it('should return error when http throws (propagates error)', fakeAsync(() => {
			httpSpy.get.and.returnValue(Promise.reject('bad'));
			let res;
			component.getMenteelist().then((r: any) => res = r);
			tick();
			expect(res).toBe('bad');
		}));
	});

	it('closePopover should call modalController.dismiss with selectedList', () => {
		component.selectedList = [{ id: 'x' }];
		component.closePopover();
		expect(modalCtrlSpy.dismiss).toHaveBeenCalledWith(component.selectedList);
	});

	it('onClearSearch should reset searchText and refresh tableData', fakeAsync(() => {
		spyOn(component, 'getMenteelist').and.returnValue(Promise.resolve(['d1'] as any));
		component.searchText = 'old';
		component.onClearSearch({}); // event not used
		tick();
		expect(component.searchText).toBe('');
		expect(component.tableData).toEqual(['d1']);
	}));

	it('filtersChanged should set selectedFilters/page and call getMenteelist', fakeAsync(() => {
		spyOn(component, 'getMenteelist').and.returnValue(Promise.resolve([]));
		component.selectedFilters = {};
		component.filtersChanged({ foo: 'bar' });
		tick();
		expect(component.selectedFilters).toEqual({ foo: 'bar' });
		expect(component.page).toBe(1);
		expect(component.setPaginatorToFirstpage).toBeTrue();
		expect(component.getMenteelist).toHaveBeenCalled();
	}));

	it('onSearch should set searchText/page and call getMenteelist', fakeAsync(() => {
		spyOn(component, 'getMenteelist').and.returnValue(Promise.resolve([]));
		component.onSearch({ searchText: 'new' });
		tick();
		expect(component.searchText).toBe('new');
		expect(component.page).toBe(1);
		expect(component.setPaginatorToFirstpage).toBeTrue();
		expect(component.getMenteelist).toHaveBeenCalled();
	}));

	describe('onButtonCLick add/remove', () => {
		beforeEach(() => {
			component.user = { id: 'u1' };
			component.tableData = [
				{ id: 't1', name: 'T1', organization: 'O1', action: component.actionButtons.ADD, enrolled_type: 'NOT_ENROLLED' },
				{ id: 'u1', name: 'Me', organization: 'Ome', action: component.actionButtons.ADD, enrolled_type: 'NOT_ENROLLED' }
			];
			component.selectedList = [];
			component.maxCount = 3;
			component.data = _.cloneDeep(baseInput);
			component.data.control.meta.multiSelect = true;
		});

		it('should add item when action = ADD and multiSelect true and within maxCount', () => {
			const item = { element: component.tableData[0], action: 'ADD' };
			component.onButtonCLick(item);
			// item should be added to selectedList and action changed to REMOVE
			expect(component.selectedList.length).toBe(1);
			const idx = component.tableData.findIndex(x => x.id === 't1');
			expect(component.tableData[idx].action).toEqual(component.actionButtons.REMOVE);
		});

		it('should call modalController.dismiss when multiSelect is false', () => {
			component.data.control.meta.multiSelect = false;
			const item = { element: component.tableData[0], action: 'ADD' };
			component.onButtonCLick(item);
			expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
		});

		it('should remove item when action = REMOVE', () => {
			// pre-populate selectedList and set actionButtons for table
			component.selectedList = [{ id: 't1' }];
			// set tableData action to REMOVE
			component.tableData[0].action = component.actionButtons.REMOVE;
			const item = { element: component.tableData[0], action: 'REMOVE' };
			component.onButtonCLick(item);
			// selectedList should be filtered out
			expect(component.selectedList.findIndex(x => x.id === 't1')).toBe(-1);
			// tableData action should be ADD again
			expect(component.tableData[0].action).toEqual(component.actionButtons.ADD);
		});
	});

	it('onPaginatorChange should set page/limit and call getMenteelist', fakeAsync(() => {
		spyOn(component, 'getMenteelist').and.returnValue(Promise.resolve([]));
		component.onPaginatorChange({ page: 2, pageSize: 10 });
		tick();
		expect(component.page).toBe(2);
		expect(component.limit).toBe(10);
		expect(component.getMenteelist).toHaveBeenCalled();
	}));

	it('loadMore should append data and disable infinite scroll when no data', fakeAsync(() => {
		// prepare current tableData
		component.tableData = [{ id: 'a' }];
		// first call returns empty array -> disable infinite
		spyOn(component, 'getMenteelist').and.returnValues(Promise.resolve([] as any), Promise.resolve([{ id: 'b' } as any]));
		const mockEvent: any = { target: { complete: jasmine.createSpy('complete') } };

		// first loadMore: no results
		component.loadMore(mockEvent);
		tick();
		expect(component.disableInfiniteScroll).toBeTrue();

		// reset flags and test when it returns data
		component.disableInfiniteScroll = false;
		component.page = 1;
		component.tableData = [{ id: 'a' }];
		// second call (the spy's second return) - simulate event again
		component.loadMore(mockEvent);
		tick();
		// tableData should be concatenated
		expect(component.tableData.length).toBe(2);
		expect(mockEvent.target.complete).toHaveBeenCalled();
	}));

	it('onSorting should set sortingData and call getMenteelist', () => {
		spyOn(component, 'getMenteelist');
		component.onSorting({ order: 'desc', sort_by: 'name' });
		expect(component.page).toBe(1);
		expect(component.setPaginatorToFirstpage).toBeTrue();
		expect(component.sortingData).toEqual({ order: 'desc', sort_by: 'name' });
		expect(component.getMenteelist).toHaveBeenCalled();
	});

	it('extractLabels should flatten and set chips', () => {
		const data = { role: ['r1', 'r2'], org: ['o1'] };
		component.extractLabels(data);
		expect(component.chips).toContain('r1');
		expect(component.chips).toContain('o1');
		expect(component.chips.length).toBe(3);
	});

	it('removeFilteredData should unselect option and remove from selectedFilters', () => {
		component.filterData = [
			{ options: [{ value: 'a', selected: true }, { value: 'b', selected: false }] },
			{ options: [{ value: 'c', selected: true }] }
		];
		component.selectedFilters = { role: [{ value: 'a' }, { value: 'x' }], org: [{ value: 'c' }] };

		component.removeFilteredData('a');

		// option a should be deselected
		expect(component.filterData[0].options[0].selected).toBeFalse();
		// selectedFilters.role should no longer contain 'a'
		expect(component.selectedFilters.role.some((i: any) => i.value === 'a')).toBeFalse();
	});

	it('removeChip should remove chip and call getMenteelist', fakeAsync(() => {
		spyOn(component, 'getMenteelist').and.returnValue(Promise.resolve([]));
		component.chips = ['chip1', 'chip2'];
		component.selectedFilters = { role: [{ value: 'chip1' }] };
		component.filterData = [{ options: [{ value: 'chip1', selected: true }] }];

		component.removeChip({ index: 0, chipValue: 'chip1' });
		tick();

		expect(component.chips).not.toContain('chip1');
		expect(component.getMenteelist).toHaveBeenCalled();
	}));

	describe('onClickFilter modal flow', () => {
		it('should create modal and handle onDidDismiss with closed role', fakeAsync(() => {
			const modalObj: any = {
				present: jasmine.createSpy('present'),
				onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: { role: 'closed', data: 'newFilter' } }))
			};
			modalCtrlSpy.create.and.returnValue(Promise.resolve(modalObj));

			component.filterData = [{ options: [] }];
			component.onClickFilter();
			tick();

			expect(modalCtrlSpy.create).toHaveBeenCalled();
			// onDidDismiss returned role 'closed' -> filterData replaced
			expect(component.filterData).toBe('newFilter' as any);
		}));

		it('should handle returned selectedFilters and update tableData', fakeAsync(() => {
			const returnedData = { data: { data: { selectedFilters: { role: ['r1'] } } } };
			const modalObj: any = {
				present: jasmine.createSpy('present'),
				onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve(returnedData))
			};
			modalCtrlSpy.create.and.returnValue(Promise.resolve(modalObj));
			spyOn(component, 'getMenteelist').and.returnValue(Promise.resolve([]));

			component.onClickFilter();
			tick();

			// after onDidDismiss, selectedFilters should be set and getMenteelist called
			tick();
			expect(component.selectedFilters).toBeDefined();
			expect(component.setPaginatorToFirstpage).toBeTrue();
			expect(component.getMenteelist).toHaveBeenCalled();
		}));
	});

});