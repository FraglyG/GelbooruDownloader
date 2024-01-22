import colors from "colors"

function green(stuff: string) {
    console.log(colors.green(stuff))
}

function blue(stuff: string) {
    console.log(colors.blue(stuff))
}

function red(stuff: string) {
    console.log(colors.red(stuff))
}

function yellow(stuff: string) {
    console.log(colors.yellow(stuff))
}

function cyan(stuff: string) {
    console.log(colors.cyan(stuff))
}

function magenta(stuff: string) {
    console.log(colors.magenta(stuff))
}

function white(stuff: string) {
    console.log(colors.white(stuff))
}

function black(stuff: string) {
    console.log(colors.black(stuff))
}

function gray(stuff: string) {
    console.log(colors.gray(stuff))
}

function grey(stuff: string) {
    console.log(colors.grey(stuff))
}

/// other

function line() {
    console.log(colors.gray("--------------------------------------------------"))
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