import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should calculate total pages correctly', () => {
    component.totalItems = 45;
    component.pageSize = 10;
    expect(component.totalPages).toBe(5);
  });

  it('should calculate start and end items accurately', () => {
    component.totalItems = 45;
    component.pageSize = 10;
    component.currentPage = 2;
    expect(component.startItem).toBe(11);
    expect(component.endItem).toBe(20);
  });

  it('should emit pageChange when navigating to valid page', () => {
    component.totalItems = 45;
    component.pageSize = 10;
    component.currentPage = 1;

    let targetPage = 0;
    component.pageChange.subscribe(p => {
      targetPage = p;
    });

    component.goToPage(2);
    expect(targetPage).toBe(2);
  });

  it('should not emit pageChange when target page is out of bounds', () => {
    component.totalItems = 20;
    component.pageSize = 10;
    component.currentPage = 1;

    let emitted = false;
    component.pageChange.subscribe(() => {
      emitted = true;
    });

    component.goToPage(0);
    component.goToPage(3);
    expect(emitted).toBe(false);
  });
});
