import fs from 'node:fs'
import path from 'node:path'
import type { StoredComic } from './types'

function safeSegment(value: string, fallback: string) {
    const normalized = value
        .normalize('NFKC')
        .trim()
        // eslint-disable-next-line no-control-regex
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
        .replace(/[. ]+$/g, '')
        .slice(0, 100)
    return normalized || fallback
}

function createViewLink(source: string, destination: string) {
    if (fs.existsSync(destination)) return 'existing' as const
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    try {
        const target =
            process.platform === 'win32'
                ? path.resolve(source)
                : path.relative(path.dirname(destination), source)
        fs.symlinkSync(
            target,
            destination,
            process.platform === 'win32' ? 'junction' : 'dir'
        )
        return 'linked' as const
    } catch {
        fs.mkdirSync(destination, { recursive: true })
        fs.writeFileSync(
            path.join(destination, '.pica-library-link.json'),
            JSON.stringify(
                { schemaVersion: 1, objectPath: path.resolve(source) },
                null,
                2
            )
        )
        return 'manifest' as const
    }
}

export function organizeLibraryViews(dataDir: string, comics: StoredComic[]) {
    const libraryRoot = path.join(dataDir, 'library')
    const objectsRoot = path.join(libraryRoot, 'objects')
    const viewsRoot = path.join(libraryRoot, 'views')
    let linked = 0
    let existing = 0
    let manifests = 0
    let skipped = 0

    const add = (source: string, destination: string) => {
        const result = createViewLink(source, destination)
        if (result === 'linked') linked += 1
        else if (result === 'manifest') manifests += 1
        else existing += 1
    }

    for (const comic of comics) {
        const source = path.join(objectsRoot, comic.comicId)
        if (!fs.existsSync(source)) {
            skipped += 1
            continue
        }
        const comicFolder = `${safeSegment(comic.title, 'untitled')} [${comic.comicId}]`
        const author = safeSegment(
            comic.canonicalAuthor ?? comic.author,
            'unknown-author'
        )
        add(source, path.join(viewsRoot, 'by-author', author, comicFolder))
        if (comic.circle) {
            add(
                source,
                path.join(
                    viewsRoot,
                    'by-circle',
                    safeSegment(comic.circle, 'unknown-circle'),
                    comicFolder
                )
            )
        }
    }

    const result = {
        generatedAt: new Date().toISOString(),
        viewsRoot,
        linked,
        existing,
        manifests,
        skipped
    }
    fs.mkdirSync(viewsRoot, { recursive: true })
    fs.writeFileSync(
        path.join(viewsRoot, 'index.json'),
        JSON.stringify({ ...result, comics }, null, 2)
    )
    return result
}
