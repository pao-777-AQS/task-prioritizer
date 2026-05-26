import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TaskService, Task } from './services/task.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('priorityChart') chartRef!: ElementRef;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filterPriority: string = 'todos';
  chart: any;
  showForm = false;
  newTask: Partial<Task> = { title: '', description: '', priority: 'medio', completed: false };

  constructor(private taskService: TaskService) {}

  ngOnInit() { this.loadTasks(); }

  ngAfterViewInit() { this.renderChart(); }

  loadTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilter();
      setTimeout(() => this.renderChart(), 100);
    });
  }

  applyFilter() {
    this.filteredTasks = this.filterPriority === 'todos'
      ? this.tasks
      : this.tasks.filter(t => t.priority === this.filterPriority);
  }

  get counts() {
    return {
      alto: this.tasks.filter(t => t.priority === 'alto' && !t.completed).length,
      medio: this.tasks.filter(t => t.priority === 'medio' && !t.completed).length,
      bajo: this.tasks.filter(t => t.priority === 'bajo' && !t.completed).length,
      total: this.tasks.length,
      completadas: this.tasks.filter(t => t.completed).length
    };
  }

  renderChart() {
    if (!this.chartRef) return;
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Alto', 'Medio', 'Bajo'],
        datasets: [{
          data: [this.counts.alto, this.counts.medio, this.counts.bajo],
          backgroundColor: ['#E24B4A', '#EF9F27', '#639922'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw} tareas` } }
        }
      }
    });
  }

  saveTask() {
    if (!this.newTask.title) return;
    this.taskService.createTask(this.newTask).subscribe(() => {
      this.newTask = { title: '', description: '', priority: 'medio', completed: false };
      this.showForm = false;
      this.loadTasks();
    });
  }

  toggleComplete(task: Task) {
    this.taskService.updateTask(task._id!, { completed: !task.completed }).subscribe(() => this.loadTasks());
  }

  deleteTask(id: string) {
    if (confirm('¿Eliminar esta tarea?')) {
      this.taskService.deleteTask(id).subscribe(() => this.loadTasks());
    }
  }
}