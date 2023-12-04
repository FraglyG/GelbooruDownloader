import axios, { AxiosError } from "axios"
import path from "path"
import fs from "fs"
import log from "./log.js"
import { settings } from "./options/settings.js"

let auth = fs.readFileSync(path.join(process.cwd(), "auth.txt"), "utf-8")

export type GelbooruImage = {
    id: number;
    created_at: string;
    score: number;
    width: number;
    height: number;
    md5: string;
    directory: string;
    image: string;
    rating: 'safe' | 'questionable' | 'explicit';
    source: string;
    change: number;
    owner: string;
    creator_id: number;
    parent_id: number;
    sample: number;
    preview_height: number;
    preview_width: number;
    tags: string;
    title: string;
    has_notes: 'true' | 'false';
    has_comments: 'true' | 'false';
    file_url: string;
    preview_url: string;
    sample_url: string;
    sample_height: number;
    sample_width: number;
    status: 'active' | 'pending' | 'flagged' | 'deleted';
    post_locked: number;
    has_children: 'true' | 'false';
};


export async function searchTags(tags: string[], page: number = 0, limit: number = 100) {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    const timeout = 15 * 1000; // 5 seconds

    const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=${limit}&pid=${page}&tags=` + tags.join("+") + auth;

    let retryCount = 0;
    let response;

    while (retryCount < maxRetries) {
        // console.log(`Attempt: ${retryCount + 1}/${maxRetries}`)
        try {
            response = await axios.get(url, { timeout });
            break;
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.code === "ECONNABORTED" || axiosError.response === undefined) {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                return { images: undefined, attribute: undefined };
            }
        }
    }

    if (response === undefined) {
        return { images: undefined, attribute: undefined };
    }

    const attribute = response.data["@attributes"] as { count: number, offset: number, limit: number };
    const images = response.data.post as GelbooruImage[] | undefined;

    return { images, attribute };
}

type DownloadCallbackFunction = (image: GelbooruImage, path: string, fileSize: number) => void

async function downloadImage(image: GelbooruImage, location: string, cb: DownloadCallbackFunction) {
    const url = image.file_url;
    const response = await axios.get(url, { responseType: 'stream', timeout: 5 * 1000 });

    if (response.status != 200) {
        erase()
        throw new Error(`Error downloading image: ${image.id} with error: ${response.status} - ${response.statusText}`);
    }

    const filePath = path.join(location, `${image.id}${path.extname(url)}`);
    const file = fs.createWriteStream(filePath);
    const total = parseInt(response.headers['content-length'] as string, 10);

    response.data.pipe(file);

    cb(image, filePath, total);
}

async function downloadImageRobust(image: GelbooruImage, location: string, cb: DownloadCallbackFunction) {
    let retires = 0;
    const maxRetries = 3;

    while (retires < maxRetries) {
        try {
            await downloadImage(image, location, cb);
            break
        } catch (error) {
            retires++;
            erase()
            log.red(`Error downloading image: ${image.id} with error: ${error}\nRetrtying...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

function erase() {
    process.stdout.write("\r\x1b[K")
}

export async function downloadImages(tags: string[], downloadCount: number | undefined, cb: DownloadCallbackFunction) {
    const location = path.join(settings.location, tags.join('_'));

    if (!fs.existsSync(location)) {
        fs.mkdirSync(location, { recursive: true });
    }

    const { attribute } = await searchTags(tags);

    if (!attribute) {
        erase()
        log.red('Something went wrong..');
        return;
    }

    const imagesToDownload = downloadCount || attribute.count;
    const toDownloadPageCount = Math.floor(imagesToDownload / 100);
    const downloadOffset = imagesToDownload - toDownloadPageCount * 100;

    // console.log(`Downloading ${imagesToDownload} images from ${toDownloadPageCount} pages with ${downloadOffset} images on the last page.`);

    for (let page = 0; page <= toDownloadPageCount; page++) {

        const imagesLeft = (toDownloadPageCount - page) * 100 + downloadOffset;
        const imageLimit = Math.min(imagesLeft, 100);

        const { attribute, images } = await searchTags(tags, page, imageLimit);

        if (!attribute) {
            erase()
            log.red("Couldn't connect to Gelbooru, Exiting Download.");
            break;
        }

        if (!images || images.length === 0) {
            erase()
            console.log('No images found on this page. Exiting Download.');
            break;
        }

        // console.log(`Attempting to download ${imageLimit} images from page ${page}, there's ${imagesLeft} images left to download.`);

        const download = async (image: GelbooruImage) => {
            try {
                await downloadImageRobust(image, location, cb);
            } catch (error) {
                erase()
                log.red(`Error downloading image: ${image.id} with error: ${error}`);
            }
        };

        try {
            await Promise.all(images.map((image) => download(image)));
        } catch (error) {
            erase()
            log.red(`Error downloading images: ${error}`);
        }

        // wait 3 seconds before downloading the next page
        // log.green("Done with page " + page + ", waiting 3 seconds...")
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// make sure auth file exists
if (!fs.existsSync(path.join(process.cwd(), "auth.txt"))) {
    fs.writeFileSync(path.join(process.cwd(), "auth.txt"), "")
}

export function hasAuthText() {
    auth = fs.readFileSync(path.join(process.cwd(), "auth.txt"), "utf-8")
    return auth != ""
}

export function saveAuthText(authText: string) {
    fs.writeFileSync(path.join(process.cwd(), "auth.txt"), authText)
    auth = authText
}