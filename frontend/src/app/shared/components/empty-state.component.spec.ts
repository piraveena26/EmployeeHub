import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display icon, title, and description', () => {
    component.icon = 'search_off';
    component.title = 'No search results';
    component.description = 'Try another search query.';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h3')?.textContent).toContain('No search results');
    expect(el.querySelector('p')?.textContent).toContain('Try another search query.');
  });

  it('should emit onAction when CTA button is clicked', () => {
    let clicked = false;
    component.onAction.subscribe(() => {
      clicked = true;
    });

    component.actionLabel = 'Create Record';
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button).not.toBeNull();
    button?.click();

    expect(clicked).toBe(true);
  });
});
