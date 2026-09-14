import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent, TableColumn } from './data-table.component';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
  });

  it('should create table component', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when data array is empty', () => {
    component.columns = [{ key: 'name', label: 'Name' }];
    component.data = [];
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('table')).toBeNull();
    expect(el.querySelector('app-empty-state')).not.toBeNull();
  });

  it('should render table rows when data is provided', () => {
    component.columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ];
    component.data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('table')).not.toBeNull();
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should cycle sorting direction and emit sortChange', () => {
    const col: TableColumn = { key: 'name', label: 'Name', sortable: true };
    component.columns = [col];
    component.data = [{ id: 1, name: 'Test' }];

    let emittedSort: any = null;
    component.sortChange.subscribe(e => {
      emittedSort = e;
    });

    component.handleSort(col);
    expect(emittedSort).toEqual({ column: 'name', direction: 'asc' });

    component.handleSort(col);
    expect(emittedSort).toEqual({ column: 'name', direction: 'desc' });

    component.handleSort(col);
    expect(emittedSort).toEqual({ column: 'name', direction: null });
  });
});
