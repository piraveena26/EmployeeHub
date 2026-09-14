import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should format status string with spaces and title case', () => {
    component.status = 'ON_LEAVE';
    expect(component.displayLabel).toBe('On Leave');
  });

  it('should prefer custom label override if provided', () => {
    component.status = 'ACTIVE';
    component.label = 'Custom Active Label';
    expect(component.displayLabel).toBe('Custom Active Label');
  });

  it('should apply emerald classes for active or approved status', () => {
    component.status = 'ACTIVE';
    expect(component.badgeClasses).toContain('bg-emerald-50');
    expect(component.dotClasses).toContain('bg-emerald-500');
  });

  it('should apply rose classes for inactive, absent, or rejected status', () => {
    component.status = 'INACTIVE';
    expect(component.badgeClasses).toContain('bg-rose-50');
    expect(component.dotClasses).toContain('bg-rose-500');
  });

  it('should handle edge cases like null or empty status gracefully', () => {
    component.status = '';
    expect(component.displayLabel).toBe('Unknown');
    expect(component.badgeClasses).toContain('bg-slate-100');
  });
});
