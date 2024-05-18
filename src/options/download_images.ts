import colors from "colors"
import cliProgress from "cli-progress"
import { OptionReturn, convertBytesToBestFit, qio } from "../index.js"
import { downloadImages, searchTags } from "../downloader.js"
import log from "../log.js"

export function createProgess(min: number, max: number, current: number) {
    const bar = new cliProgress.SingleBar({
        format: "Downloading |" + colors.cyan("{bar}") + "| " + colors.blue("{percentage}%") + " || " +
            colors.green("{value}") + "/" + colors.green("{total}") + " Images " +
            "( {imagesPerSecond} images/s | {downloadSpeed} )",
        hideCursor: true,
    }, cliProgress.Presets.shades_classic)

    bar.start(max, current, {
        downloadSpeed: "0.00 MB/s",
        imagesPerSecond: "0.00",
    })

    return bar
}

export default async function downloadOption(): Promise<OptionReturn> {
    const tags = await qio("Enter tags to search for [separate tags with commas, example: 'grin, 1girl, cat']")

    const tagList = tags.split(",").map((tag) => tag.trim())

    const results = await searchTags(tagList)

    if (!results.attribute) {
        return { lastLog: "Couldn't connect to Gelbooru...", logType: "red" }
    }

    if (results.attribute.count == 0 || !results.images) {
        return { lastLog: "No images found matching these tags:\n" + tagList.join(", "), logType: "red" }
    }

    log.green(`Found ${results.attribute.count} images matching those tags!`)

    let size = 0
    let sizeArray: { size: number, created: number }[] = []

    // IMAGE DOWNLOAD
    const download = await qio("Download images? [y/n] (TIP: you can respond with a number instead to download specific amount of images)")
    const downloadNumber = parseInt(download)

    const downloadNumberProvide = !isNaN(downloadNumber) ? downloadNumber : undefined
    const totalAmountDownload = downloadNumberProvide || results.attribute.count

    if (download == "y" || downloadNumberProvide) {
        const countText = !isNaN(downloadNumber) ? downloadNumber + " " : ""
        log.blue(`Downloading ${countText}images...`)

        let downloadedImages = 0
        let downloadedImagesArray: { created: number }[] = []

        const bar = createProgess(0, totalAmountDownload, 0)
        const started = Date.now()

        try {
            await downloadImages(tagList, downloadNumberProvide, async (image, path, fileSize) => {
                const now = Date.now()
                const startCheck = now - 5_000 // 5 seconds ago

                // Add new metric data
                sizeArray.push({ size: fileSize, created: now })
                downloadedImagesArray.push({ created: now })

                // Remove Old Metric Data
                sizeArray = sizeArray.filter((x) => x.created > startCheck)
                downloadedImagesArray = downloadedImagesArray.filter((x) => x.created > startCheck)

                // Add counter
                size += fileSize
                downloadedImages++

                // Get Bar Metrics
                const bitAgoSizes = sizeArray.reduce((a, b) => a + b.size, 0)
                const bitAgoDownloadedImages = downloadedImagesArray.length

                bar.increment(1, {
                    downloadSpeed: convertBytesToBestFit(bitAgoSizes / ((now - startCheck) / 1000)) + "/s",
                    imagesPerSecond: (bitAgoDownloadedImages / ((now - startCheck) / 1000)).toFixed(2),
                })
            })
        } catch (error) {
            return { lastLog: "Something went wrong while downloading images:\n" + error, logType: "red" }
        }

        bar.stop()
        console.clear()

        return { lastLog: "Succesfully downloaded " + totalAmountDownload + " images, total size: " + convertBytesToBestFit(size), logType: "green" }
    }

    return { lastLog: "Download cancelled", logType: "yellow" }
}