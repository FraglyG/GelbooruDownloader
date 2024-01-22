import { OptionReturn, qio } from "../index.js"
import log from "../log.js"
import fs from "fs"
import path from "path"

import { QuickDB } from "quick.db"
export const db = new QuickDB();

export async function getSettings() {
    let settings = {
        location: await db.get("location") || path.join(process.cwd(), "downloads"),
    }

    if (!fs.existsSync(settings.location)) {
        fs.mkdirSync(settings.location, { recursive: true })
    }

    return settings;
}

export default async function settingsOption(): Promise<OptionReturn> {
    const settings = await getSettings()

    while (true) {
        console.clear()
        const option = await qio(`Options:\n\n1. Change download location [Current: '${settings.location}']\n` +
            `2. Back`)

        if (option == "1") {
            console.log("Currently set to:\n" + settings.location)
            const location = await qio("Enter new download location [leave blank for default]")

            if (!fs.existsSync(location)) {
                log.red("Couldn't find " + location + "! Make sure the directory exists")
                continue
            }

            db.set("location", location)
            log.green("Download location changed to " + location)
        } else if (option == "2") {
            break
        }
    }

    return { lastLog: "Settings saved!", logType: "green" }
}
