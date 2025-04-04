#!/usr/bin/env node

const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const chalk = require("chalk");
const { program } = require("commander");

const projectTypes = [
  {
    name: 'CLI application',
    value: 'cli',
    description: 'A command-line interface application',
    templatePath: path.resolve(__dirname, '../templates/cli')
  },
  // {
  //   name: 'API service',
  //   value: 'api',
  //   description: 'A RESTful API service',
  //   templatePath: path.resolve(__dirname, '../templates/api')
  // },
  // {
  //   name: 'Fullstack application',
  //   value: 'fullstack',
  //   description: 'A fullstack application',
  //   templatePath: path.resolve(__dirname, '../templates/fullstack')
  // },
  // {
  //   name: 'Electron application',
  //   value: 'electron',
  //   description: 'A desktop application',
  //   templatePath: path.resolve(__dirname, '../templates/electron')
  // }
]
program
  .name("create-vibe-flow")
  .description("Create a new Vibe Flow project")
  .argument("[project-name]", "The name of your project")
  .action(async (projectName) => {
    try {
      let projectDir = projectName;
      // Ask for project name if not provided
      if (!projectDir) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectDir',
            message: 'What is your project named?',
            default: 'my-vibe-flow-app'
          }
        ]);
        projectDir = answers.projectDir;
      }


      // choices the project type
      // 1. CLI application
      // 2. API service
      // 3. Fullstack application
      // 4. Electron application
      const { projectType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'projectType',
          message: 'What type of project do you want to create?',
          choices: projectTypes.map(type => ({
            name: `${type.name} (${type.description})`,
            value: type.value,
            short: type.name
          })),
          default: 'cli'
        }
      ]);

      const targetDir = path.resolve(process.cwd(), projectDir);

      // Check if directory exists
      if (fs.existsSync(targetDir)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Directory ${projectDir} already exists. Do you want to overwrite it?`,
            default: false
          }
        ]);

        if (!overwrite) {
          console.log(chalk.red('Operation cancelled'));
          process.exit(1);
        }

        await fs.remove(targetDir);
      }

      // Create project directory
      await fs.ensureDir(targetDir);

      const templatePath = projectTypes.find(type => type.value === projectType).templatePath;

      // Copy template
      const templateDir = path.resolve(__dirname, templatePath);
      console.log(chalk.blue(`Creating a new Vibe Flow project in ${chalk.green(targetDir)}...`));

      await fs.copy(templateDir, targetDir);

      // Update package.json in the new project
      const pkgJsonPath = path.join(targetDir, 'package.json');
      const pkgJson = await fs.readJson(pkgJsonPath);
      pkgJson.name = projectDir.toLowerCase().replace(/\s+/g, '-');
      await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });

      // rename .gitignore.example to .gitignore
      await fs.rename(path.join(targetDir, '.gitignore.example'), path.join(targetDir, '.gitignore'));

      console.log();
      console.log(chalk.green('Success!'), 'Created', chalk.cyan(projectDir), 'at', chalk.cyan(targetDir));
      console.log();
      console.log('Inside that directory, you can run several commands:');
      console.log();
      console.log(chalk.cyan('  npm install'));
      console.log('    Install the dependencies');
      console.log();
      console.log(chalk.cyan('  npm run dev'));
      console.log('    Starts the development server');
      console.log();
      console.log('We suggest that you begin by typing:');
      console.log();
      console.log(chalk.cyan('  cd'), projectDir);
      console.log(chalk.cyan('  npm install'));
      console.log(chalk.cyan('  npm run dev'));
      console.log();
      console.log('Happy coding!');

    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  })

program.parse(process.argv);
