export async function getFilesRecursively(entry, children, ignoreReg) {
    if (entry.kind === "file") {
        const file = await entry.getFile();
        if (ignoreReg.test(entry.name)) return
        if (file !== null) {
            children.push({
                handle: entry,
                name: entry.name,
                type: entry.kind,
                file
            })
            return entry
        }
    } else if (entry.kind === "directory") {
        if (ignoreReg.test(entry.name)) return
        const curChildren = []
        children.push({
            handle: entry,
            name: entry.name,
            type: entry.kind,
            children: curChildren,
            menu: [
                { key: 'createFolder', label: '创建文件夹' },
                { key: 'createFile', label: '创建文件' }
            ]
        })
        for await (const handle of entry.values()) {
            await getFilesRecursively(handle, curChildren, ignoreReg);
        }
    }
}

export async function readFile (handle) {
    const content = await handle.getFile();
    return new Promise(resolve => {
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            resolve(e.target.result)
        };
        fileReader.readAsText(content);
    })
}
export async function writeFile(fileHandle, contents) {
    // 创建一个 FileSystemWritableFileStream 用来写入。
    const writable = await fileHandle.createWritable();

    // 将文件内容写入到流中。
    await writable.write(contents);

    // 关闭文件并将内容写入磁盘。
    await writable.close();
}