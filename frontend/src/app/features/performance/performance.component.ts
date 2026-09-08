import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService } from '../../core/services/performance.service';
import { AuthService } from '../../core/services/auth.service';
import { Goal, PerformancePeriod, PerformanceReview } from '../../core/models';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Performance & Goals</h1>
          <p class="text-xs text-slate-500 mt-0.5">Track quarterly goals, performance metrics, and review evaluations</p>
        </div>
      </div>

      <!-- Active Performance Period Header -->
      @if (periods().length > 0) {
        <div class="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-lg flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-indigo-300 uppercase tracking-wider">Current Review Cycle</span>
            <h2 class="text-xl font-bold mt-0.5">{{ periods()[0].name }}</h2>
            <div class="text-xs text-slate-300 mt-1">
              {{ periods()[0].start_date }} &rarr; {{ periods()[0].end_date }}
            </div>
          </div>
          <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            ACTIVE EVALUATION
          </span>
        </div>
      }

      <!-- Goals Grid -->
      <div>
        <h3 class="text-sm font-bold text-slate-800 mb-3">Key Performance Goals (KPIs)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (g of goals(); track g.id) {
            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800">{{ g.title }}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [class.bg-emerald-50]="g.status === 'COMPLETED'" [class.text-emerald-700]="g.status === 'COMPLETED'"
                        [class.bg-indigo-50]="g.status === 'IN_PROGRESS'" [class.text-indigo-700]="g.status === 'IN_PROGRESS'">
                    {{ g.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">{{ g.description || 'Deliver target deliverables' }}</p>
                <div class="text-[11px] text-slate-400 mt-2">Target Date: {{ g.target_date }}</div>
              </div>

              <!-- Progress Bar -->
              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Progress</span>
                  <span class="text-indigo-600 font-bold">{{ g.progress_percentage }}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-indigo-600 rounded-full" [style.width.%]="g.progress_percentage"></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Performance Reviews Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">Formal Appraisals & Evaluations</h3>
        </div>

        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5 font-bold">Cycle</th>
              <th class="px-5 py-3.5 font-bold">Employee</th>
              <th class="px-5 py-3.5 font-bold">Self Score</th>
              <th class="px-5 py-3.5 font-bold">Manager Score</th>
              <th class="px-5 py-3.5 font-bold">Final Rating</th>
              <th class="px-5 py-3.5 font-bold">Rating Grade</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (rev of reviews(); track rev.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="px-5 py-3.5 font-bold text-slate-800">{{ rev.period_details?.name || 'Cycle' }}</td>
                <td class="px-5 py-3.5 font-semibold text-slate-800">{{ rev.employee_details?.full_name || 'Staff' }}</td>
                <td class="px-5 py-3.5 font-mono font-bold text-indigo-600">{{ rev.self_rating || '-' }} / 5.0</td>
                <td class="px-5 py-3.5 font-mono font-bold text-emerald-600">{{ rev.manager_rating || '-' }} / 5.0</td>
                <td class="px-5 py-3.5 font-mono font-extrabold text-slate-900 text-sm">{{ rev.final_score || '-' }}</td>
                <td class="px-5 py-3.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 uppercase">
                    {{ rev.rating_grade }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PerformanceComponent implements OnInit {
  periods = signal<PerformancePeriod[]>([]);
  goals = signal<Goal[]>([]);
  reviews = signal<PerformanceReview[]>([]);

  constructor(private perfService: PerformanceService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.perfService.getPeriods().subscribe({
      next: res => this.periods.set(Array.isArray(res) ? res : res.results || [])
    });

    this.perfService.getMyGoals().subscribe({
      next: res => this.goals.set(res || [])
    });

    if (this.authService.isHR() || this.authService.isManager()) {
      this.perfService.getAllReviews().subscribe({
        next: res => this.reviews.set(res.results || [])
      });
    } else {
      this.perfService.getMyReviews().subscribe({
        next: res => this.reviews.set(res || [])
      });
    }
  }
}
