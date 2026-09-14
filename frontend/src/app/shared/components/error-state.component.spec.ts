import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  let component: ErrorStateComponent;
  let fixture: ComponentFixture<ErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorStateComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render customized error title and message', () => {
    component.title = 'Custom API Error';
    component.message = 'Unable to reach backend gateway.';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Custom API Error');
    expect(compiled.querySelector('p')?.textContent).toContain('Unable to reach backend gateway.');
  });

  it('should emit onRetry when retry button is clicked', () => {
    let emitted = false;
    component.onRetry.subscribe(() => {
      emitted = true;
    });

    component.showRetry = true;
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button).not.toBeNull();
    button?.click();

    expect(emitted).toBe(true);
  });
});
