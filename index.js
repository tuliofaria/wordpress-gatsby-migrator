const fs = require('fs-extra')
const args = require('minimist')(process.argv.slice(2))

const importer = require('./importer.js')
const exporter = require('./exporter.js')
const templates = require('./templates.js')
const utilities = require('./utilities.js')

const writeBlog = async (blog, rootPath) => {
    if (!rootPath.endsWith('/')) {
        rootPath = rootPath + '/'
    }

    blog.forEach(async post => {
        const postPath = `${__dirname}/${rootPath}${post.slug}`
        await fs.ensureDir(postPath)

        post.images.forEach(async image => {
            const imageResponse = await fetch(image.url)
            const writeStream = fs.createWriteStream(`${postPath}/${image.fileName}`)
            imageResponse.body.pipe(writeStream)
            await utilities.streamAsync(writeStream)
        })

        const fileContents = templates.post(post.title, post.date, post.markdownContent)
        await fs.outputFile(`${postPath}/index.md`, fileContents)
    })
}

const runner = async () => {
    const inputFile = args._[0]
    const file = fs.readFileSync(inputFile, 'utf8')
    
    const posts = await importer.importPosts(file)
    await exporter.exportPosts(posts, 'blogs')
}

runner()