import fs from 'node:fs/promises'
import path from 'node:path'
import { Pica } from '../src/sdk'

function csvCell(value: unknown) {
    const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
}

async function main() {
    const account = process.env.PICA_ACCOUNT
    const password = process.env.PICA_PASSWORD
    if (!account || !password) {
        throw new Error('PICA_ACCOUNT and PICA_PASSWORD are required')
    }

    const pica = new Pica()
    await pica.login(account, password)
    const { comics } = await pica.favoritesAll()

    const headers = [
        'position',
        'comic_id',
        'title',
        'author',
        'categories',
        'tags',
        'finished',
        'updated_at'
    ]
    const rows = comics.map((comic, index) => [
        index + 1,
        comic._id,
        comic.title.trim(),
        comic.author,
        comic.categories,
        comic.tags,
        comic.finished,
        comic.updated_at
    ])
    const csv = [headers, ...rows]
        .map((row) => row.map(csvCell).join(','))
        .join('\n')

    await fs.writeFile(
        path.resolve(process.cwd(), 'favorites.csv'),
        `\uFEFF${csv}\n`,
        'utf8'
    )
    console.log(`Exported ${rows.length} favorites to encrypted artifact input`)
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
})
