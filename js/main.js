'use strict'


window.onload = function() {
    clearTasks();
    getStatuses();
    getTasks();
};


function clearTasks()
{
    $('main > div').remove();
}


let statuses;


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
    console.log(window.location.hostname);

    const url = new URL('/tasks', `${window.location.protocol}//${window.location.hostname}`);

    if (status != null) {
        url.searchParams.set('filter', status);
    }

    console.log('fetching from URL:' + url);

    const response = await fetch(url);
    const json = await response.json();

    console.log('got ' + json.length + ' tasks');

    const tasks = json.map(task => createTaskElement(task));

    $("main").append(...tasks);
}


function createTaskElement(task)
{
    const el = document.createElement('div');

    el.innerHTML = `${task.title}: ${statuses[task.statusId]}<br>
                    More text`;

    return el;
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