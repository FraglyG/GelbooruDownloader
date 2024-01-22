import fs from "fs"
import readline from "readline"
import log from "./log.js"
import { hasAuthText, saveAuthText } from "./downloader.js"

import downloadOption from "./options/download_images.js"
import settingsOption from "./options/settings.js"

export function qio(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve) => {
        rl.question(question + "\n- ", (answer) => {
            rl.close()
            resolve(answer)
        })
    })
}

export function convertBytesToBestFit(bytes: number) {
    const units = ["B", "KB", "MB", "GB", "TB", "PB"]

    let unitIndex = 0
    while (bytes >= 1024) {
        bytes /= 1024
        unitIndex++
    }

    return bytes.toFixed(2) + " " + units[unitIndex]
}

export type OptionReturn = { lastLog: string, logType: keyof typeof log }


async function start() {
    const option = await qio("Options:\n\n1. Download images\n2. Options\n3. Exit")
    if (option == "1") {
        console.clear()
        return await downloadOption()
    } else if (option == "2") {
        console.clear()
        return await settingsOption()
    } else if (option == "3") {
        console.clear()
        process.exit(0)
    }
}

async function main() {
    log.blue("Welcome to Gelbooru Downloader!")
    log.gray("Checking Gelbooru API key...")

    while (!hasAuthText()) {
        const authText = await qio("Enter your Gelbooru API key [can be found in Gelbooru account settings]")
        saveAuthText(authText)
    }

    log.green("API key found!")
    log.line()

    let lastLog: string | undefined = undefined
    let logType: keyof typeof log = "green"

    while (true) {
        console.clear()
        log.line()

        if (lastLog) { log[logType](lastLog); log.line() }

        const returned: OptionReturn | void = await start()
        if (returned) ({ lastLog, logType } = returned)
    }
}

main()