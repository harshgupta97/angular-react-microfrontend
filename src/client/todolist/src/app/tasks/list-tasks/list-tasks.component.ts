import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { Task } from '../shared/models/task.model';
import { TasksHttpService } from '../shared/services/tasks-http.service';
import { TaskCounterService } from 'src/app/core/task-counter.service';

@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit {

  public tasks: Task[];
  public doneTasks: Task[];

  @Input()
  public taskForm: FormGroup;

  constructor(
    private tasksHttpService: TasksHttpService,
    private taskCounterService: TaskCounterService
  ) { }

  ngOnInit() {
    this.tasksHttpService.retrieveAllTasks();
    this.initTaskLists();
  }

  public editTask(task: Task): void {
    const datePipe = new DatePipe('en-US');
    const formatedDueDate = datePipe.transform(task.dueDate, 'yyyy-MM-dd');
    this.taskForm.setValue({
      id: task.id,
      title: task.title,
      dueDate: formatedDueDate
    });
    this.tasksHttpService.isEditMode.next(true);
  }

  public removeTask(task: Task): void {
    this.tasksHttpService.deleteTask(task).subscribe((response: Task) => {
      if (response) {
        this.tasksHttpService.retrieveAllTasks();
      }
    });
  }

  public markAsDone(isChecked, task: Task): void {
    task.done = isChecked.target.checked;
    this.tasksHttpService.updateTask(task).subscribe((response: Task) => {
      if (response) {
        this.tasksHttpService.retrieveAllTasks();
      }
    });
  }

  private initTaskLists(): void {
    this.tasksHttpService.getAllTasks().subscribe((allTasks: Task[]) => {
      this.tasks = allTasks;
      this.emitTotalDoneTask();
    });
  }

  public emitTotalDoneTask(): void {
    this.doneTasks = this.tasks.filter(tasks => tasks.done);
    this.taskCounterService.updateDoneTasks(this.doneTasks);
  }
}