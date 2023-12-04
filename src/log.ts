import chalk from "chalk"

function green(...stuff: any[]) {
    console.log(chalk.green(...stuff))
}

function blue(...stuff: any[]) {
    console.log(chalk.blue(...stuff))
}

function red(...stuff: any[]) {
    console.log(chalk.red(...stuff))
}

function yellow(...stuff: any[]) {
    console.log(chalk.yellow(...stuff))
}

function cyan(...stuff: any[]) {
    console.log(chalk.cyan(...stuff))
}

function magenta(...stuff: any[]) {
    console.log(chalk.magenta(...stuff))
}

function white(...stuff: any[]) {
    console.log(chalk.white(...stuff))
}

function black(...stuff: any[]) {
    console.log(chalk.black(...stuff))
}

function gray(...stuff: any[]) {
    console.log(chalk.gray(...stuff))
}

function grey(...stuff: any[]) {
    console.log(chalk.grey(...stuff))
}

/// other

function line() {
    console.log(chalk.gray("--------------------------------------------------"))
}

function space() {
    console.log("\n")
}

/// export

export default {
    green,
    blue,
    red,
    yellow,
    cyan,
    magenta,
    white,
    black,
    gray,
    grey,
    line,
    space,
}