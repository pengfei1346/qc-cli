#! /usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import spawn from 'cross-spawn'
import path from 'path'
import degit from 'degit'
import fs from 'fs-extra'
import ora from 'ora'

const program = new Command()

program
    .on('--help', () => {
        console.log(`\r\nRun ${chalk.cyan(`qt <command> --help`)} for detailed usage of given command\r\n`)
    })

const createPrompt = async (name) => {
    const { action } = await inquirer.prompt([
        {
            name: 'action',
            type: 'list',
            message: 'What type of project it is',
            choices: [
                { name: 'Project', value: 'Project' },
                { name: 'SDK', value: 'SDK' }
            ]
        }
    ])
    if (action === 'Project') {
        spawn('npm', ['create', 'vite@latest', name], { stdio: 'inherit' })
        return
    }else if (action === 'SDK') {
        const spinner = ora('waiting download template')
        spinner.start()
        const emitter = degit('github:rollup/rollup-starter-lib')
        await emitter.clone(targetDir)
            .then(() => {
                spinner.succeed('download template succeed.')
            })
            .catch(() => {
                spinner.fail('Request failed...')
            })
        return
    }

}

program.command('create <name>')
    .description('Create a new project')
    .action(async (name) => {
        const targetDir = path.join(process.cwd(), name)
        if (fs.existsSync(targetDir)) {
            // 询问用户是否确定要覆盖
            let {action} = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    message: 'Target directory already exists Pick an action:',
                    choices: [
                        {name: 'Overwrite', value: 'overwrite'},
                        {name: 'Cancel', value: false}
                    ]
                }
            ])

            if (!action) {
                return
            } else if (action === 'overwrite') {
                await fs.remove(targetDir)
                createPrompt(name)
            }
        }else {
            createPrompt(name)
        }
    })


program.parse()


