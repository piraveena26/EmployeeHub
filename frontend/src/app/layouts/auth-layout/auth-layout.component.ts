import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Ambient Glows -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/30 text-white font-extrabold text-2xl tracking-wider mb-4 border border-indigo-400/30">
          EH
        </div>
        <h2 class="text-3xl font-extrabold text-white tracking-tight">
          Employee<span class="text-indigo-400">Hub</span>
        </h2>
        <p class="mt-2 text-sm text-indigo-200/70">
          Next-Generation Enterprise Employee Management System
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div class="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          <router-outlet></router-outlet>
        </div>
        
        <div class="mt-6 text-center text-xs text-indigo-200/50">
          &copy; 2026 EmployeeHub Inc. Production Grade Architecture.
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
