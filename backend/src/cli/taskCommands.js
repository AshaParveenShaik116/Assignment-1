const JSON_FIELDS = {
  subject: 'subject',
  title: 'title',
  description: 'description',
  notes: 'importantNotes',
  status: 'status',
  priority: 'priority',
  'study-date': 'studyDate',
  'study-after': 'studyAfter',
  'study-before': 'studyBefore',
  'due-date': 'dueDate',
};

function parseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`);
    const field = JSON_FIELDS[arg.slice(2)];
    if (!field) throw new Error(`Unknown option: ${arg}`);
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Expected a value after ${arg}`);
    }
    options[field] = value;
    index += 1;
  }
  return options;
}

function printJson(value, output) {
  output(JSON.stringify(value, null, 2));
}

async function runCommand(args, apiClient, output = console.log) {
  const [command, first, ...remaining] = args;
  switch (command) {
    case 'add': {
      if (!first || first.startsWith('--')) throw new Error('Usage: task add <title> [options]');
      const task = { title: first, ...parseOptions(remaining) };
      printJson(await apiClient.create(task), output);
      return;
    }
    case 'list':
      printJson(await apiClient.list(parseOptions([first, ...remaining].filter(Boolean))), output);
      return;
    case 'show':
      if (!first) throw new Error('Usage: task show <id>');
      printJson(await apiClient.get(first), output);
      return;
    case 'update':
      if (!first) throw new Error('Usage: task update <id> --field <value>');
      printJson(await apiClient.update(first, parseOptions(remaining)), output);
      return;
    case 'complete':
      if (!first) throw new Error('Usage: task complete <id>');
      printJson(await apiClient.updateStatus(first, 'completed'), output);
      return;
    case 'archive':
      if (!first) throw new Error('Usage: task archive <id>');
      await apiClient.archive(first);
      output(`Archived study plan ${first}`);
      return;
    case 'help':
    case undefined:
      output('Usage: task <add|list|show|update|complete|archive> ... (study plans)');
      return;
    default:
      throw new Error(`Unknown command: ${command}. Run "task help" for usage.`);
  }
}

module.exports = { runCommand };
