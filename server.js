const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: 'Task files/' });
const fs = require('fs');
const app = express();
const port = 80;

app.use('/', express.static('css'));
app.use('/', express.static('js'));


app.get('/', (req, res) => {
  

  res.sendFile('./html/index.html', { root: __dirname });
});


app.get('/tasks', (req, res) => {
  const rawTasks = fs.readFileSync('tasks.json');
  let tasks = JSON.parse(rawTasks);
  const totalTasks = tasks.length;

  if (req.query.filter && req.query.filter !== 'None')
  {
    tasks = tasks.filter(task => task.status === req.query.filter);
  }

  res.send(tasks);
})


app.post('/', upload.single('file'), (req, res) => {
  if (!req.body || !req.body.task) 
  {
    return res.sendStatus(400);
  }

  const rawTasks = fs.readFileSync('tasks.json');
  let tasks = JSON.parse(rawTasks);

  const taskId = req.body.task;

  if (req.body.date)
  {
    tasks[taskId - 1].completionDate = req.body.date;
  }
  else
  {
    tasks[taskId - 1].completionDate = null;
  }

  if (req.file)
  {
    fs.renameSync('Task files/' + req.file.filename, 'Task files/' + taskId + '.bin');
    tasks[taskId - 1].hasFile = true;
  }
  else
  {
    try 
    {
      fs.unlinkSync('Task files/' + taskId + '.bin');
    } catch(err) 
    {
      // file didn't exist
    }
    tasks[taskId - 1].hasFile = false;
  }

  const writeData = JSON.stringify(tasks, null, 2);
  fs.writeFileSync('tasks.json', writeData);

  res.sendStatus(200);
})


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});