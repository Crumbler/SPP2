'use strict'

let statuses, tasks;


window.onload = function() {
    clearTasks();
    getStatuses();
    getTasks();
};


function clearTasks()
{
    $('.task').remove();
}


async function getStatuses()
{
    const response = await fetch('/statuses');
    statuses = await response.json();

    const statusOptions = statuses.map(status => createStatusOption(status));

    $('#filter-type').append(...statusOptions);
}


function createStatusOption(status)
{
    const el = document.createElement('option');
    el.textContent = status;

    return el;
}


async function getTasks(status)
{
    const url = new URL('/tasks', `${window.location.protocol}//${window.location.hostname}`);

    if (status != null) {
        url.searchParams.set('filter', status);
    }

    const response = await fetch(url);
    tasks = await response.json();

    const taskElements = tasks.map(task => createTaskElement(task));

    $("main").append(...taskElements);
}


function createTaskElement(task)
{
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    taskContent.innerHTML = `${task.title}: ${statuses[task.statusId]}<br>
                    More text`;

    const icon1 = document.createElement('icon');
    icon1.className = 'icon icon-edit';

    const buttonEdit = document.createElement('button');
    buttonEdit.className = 'task-button';
    buttonEdit.append(icon1);

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