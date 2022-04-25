import {mkdir, rm, utimes, writeFile} from "fs/promises";
import * as glob from 'glob'
import {build} from "esbuild";
import AdmZip from "adm-zip";

const srcDir = 'src/lambdaFunctions'
const buildDir = 'build/lambdaFunctions'
const distDir = 'dist'

// Last-modified time that we apply to bundled JS files
const fileTime = new Date('2021-02-02T00:00:00.000Z')

// TODO - try using top-level await here? Or just wait to Node 16?
// noinspection JSIgnoredPromiseFromCall
doBuild()

async function doBuild() {
    await rm(buildDir, {recursive: true, force: true})
    await rm(distDir, {recursive: true, force: true})

    // Assumes that the files named "lambda.*" under src/lambdaFunctions
    // contain all the lambda handlers in the app.
    const sourceLambdaPaths = glob.sync(`${srcDir}/**/lambda.*`, {})
    console.log(`Found ${sourceLambdaPaths.length} Lambda entry points - running esbuild`)
    await bundleLambdaFiles(sourceLambdaPaths)

    const bundledLambdaPaths = glob.sync(`${buildDir}/**/lambda.js`, {})
    await zipLambdas(bundledLambdaPaths)
}

async function bundleLambdaFiles(sourceLambdaPaths: string[]) {
    return await build({
        bundle: true,
        target: 'node14',
        entryPoints: sourceLambdaPaths,
        write: true,
        outdir: buildDir,
        // Required to make output the same whether there is one, or more than one, element in sourceLambdaPaths
        outbase: srcDir,
        platform: 'node',
        sourcemap: 'inline',
        sourcesContent: false
    })
}

async function zipLambdas(bundledLambdaPaths: string[]) {
    await mkdir('dist')

    // For each bundled lambda at ${buildDir}/foo/lambda.js,
    // put it in a zip file at dist/foo.zip

    await Promise.all(bundledLambdaPaths.map(async (bundledLambdaPath) => {
        // Set timestamp on bundled file so that it's always the same, and zip-file metadata doesn't change (for deterministic / reproducible builds)
        await utimes(bundledLambdaPath, fileTime, fileTime)
        const zipFile = `dist/${(bundledLambdaPath.split('/'))[2]}.zip`
        console.log(`Zipping ${bundledLambdaPath} to ${zipFile}`)

        // Note that this implementation is slower than calling system zip, but is cross-platform
        const zip = new AdmZip()
        zip.addLocalFile(bundledLambdaPath)
        await writeFile(zipFile, zip.toBuffer());
    }))
}