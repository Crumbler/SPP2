'use strict'

let statuses, tasks, currentTask,
    currentTaskElement;


window.onload = function() {
    clearTasks();
    getStatuses();
    getTasks();
};


function clearTasks() {
    $('.task').remove();
}


async function getStatuses() {
    const response = await fetch('/statuses');
    statuses = await response.json();

    const statusOptions = statuses.map(status => createStatusOption(status));

    $('#filter-type').append(...statusOptions);
    $('.modal #task-status').append(...statusOptions);
}


function createStatusOption(status) {
    const el = document.createElement('option');
    el.textContent = status;

    return el;
}


async function getTasks(status) {
    const url = new URL('/tasks', `${window.location.protocol}//${window.location.hostname}`);

    if (status != null) {
        url.searchParams.set('filter', status);
    }

    const response = await fetch(url);
    tasks = await response.json();

    const taskElements = tasks.map(task => createTaskElement(task));

    $("main").append(...taskElements);
}


function getTaskHTML(task) {
    return `${task.title}: ${statuses[task.statusId]}<br>
            Completion date: ${task.completionDate ?? 'None'}<br>
            File: ${task.file ?? 'None'}`;
}


function createTaskElement(task) {
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    taskContent.innerHTML = getTaskHTML(task);

    const icon1 = document.createElement('icon');
    icon1.className = 'icon icon-edit';

    const buttonEdit = document.createElement('button');
    buttonEdit.className = 'task-button';
    buttonEdit.append(icon1);
    buttonEdit.onclick = onEditClick;

    const icon2 = document.createElement('icon');
    icon2.className = 'icon icon-delete';

    const buttonDelete = document.createElement('button');
    buttonDelete.className = 'task-button';
    buttonDelete.append(icon2);

    const taskDropdown = document.createElement('div');
    taskDropdown.className = 'task-dropdown';
    taskDropdown.append(buttonEdit, buttonDelete);

    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.task = task;
    taskElement.append(taskContent, taskDropdown);

    return taskElement;
}


$('header > form').submit(event => {
    event.preventDefault();

    clearTasks();

    const selectedVal = document.getElementById('filter-type').selectedIndex;
    
    if (selectedVal >= 1 && selectedVal <= statuses.length)
    {
        getTasks(selectedVal - 1);
    }
    else
    {
        getTasks();
    }
});


const modal = $('.modal')[0],
      modalForm = $('.modal-content')[0];


function resetModalForm() {
    modalForm.reset();
}


function hideModal() {
    modal.style.display = 'none';
}


function showModal() {
    modal.style.display = 'block';
}


function onEditClick(event)
{
    currentTaskElement = this.parentNode.parentNode;

    currentTask = currentTaskElement.task;

    resetModalForm();

    showModal();
}


$('form.modal-content').submit(async function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    if (formData.get('date') === undefined) {
        formData.set('date', null);
    }

    const statusId = $('#task-status')[0].selectedIndex;

    formData.set('statusid', statusId);
    
    const response = await fetch(`/tasks/${currentTask.id}/update`, {
        method: 'PUT',
        body: formData
    });

    const result = await response.text();

    if (result === 'OK') {
        currentTask.title = formData.get('name');
        currentTask.statusId = statusId;
        currentTask.completionDate = formData.get('date');

        currentTaskElement.firstChild.innerHTML = getTaskHTML(currentTask);
    }

    hideModal();
})


$('.modal-content .button-close').click(event => {
    hideModal();
})