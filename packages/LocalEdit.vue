<script setup>

import TreeFolder from "./TreeFolder.vue";
import ElButton from "element-ui/packages/button";
import {ref, defineProps} from "vue";
import {getFilesRecursively, readFile, writeFile} from "./tools";
import {MessageBox} from "element-ui";
const props = defineProps({
  ignore: {
    type: String,
    default: ''
  }
})
const folderList = ref([])
const openDirectory = async () => {
    if (!window.showDirectoryPicker) return
    const directoryHandle = await window.showDirectoryPicker();
    const root = []
    const filterPath = new RegExp(props.ignore)
    await getFilesRecursively(directoryHandle, root, filterPath)
    folderList.value = root
}
const fileOperateLoading = ref(false)
const content = ref('')
const curHandle = ref(null)
const edit = ref(false)
const choose = async item => {
    if (item.type === 'directory') return
    edit.value = true
    fileOperateLoading.value = true
    const res = await readFile(item.handle)
    fileOperateLoading.value = false
    content.value = res
    curHandle.value = item.handle
}
const saveContent = async event => {
    fileOperateLoading.value = true
    const newContent = event.target.innerText
    await writeFile(curHandle.value, newContent)
    fileOperateLoading.value = false
    edit.value = false
}
const clickMenu = async ({ menu, item }) => {
    /**
     * @type{ String }
     */
    const name = await new Promise(resolve => {
        MessageBox.prompt('请输入名称', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        }).then(({ value }) => {
            // value
            resolve(value)
        }).catch(() => {
            resolve('')
        })
    })
    if (!name) return
    fileOperateLoading.value = true
    if (menu.key === 'createFolder') {
        const directoryHandle = await item.handle.getDirectoryHandle(name, {create: true});
        item.children.push({
            handle: directoryHandle,
            name: name,
            type: 'directory',
            menu: [
                { key: 'createFolder', label: '创建文件夹' },
                { key: 'createFile', label: '创建文件' }
            ],
            children: []
        })
    } else if (menu.key === 'createFile') {
        const fileHandle = await item.handle.getFileHandle(name, {create: true});
        item.children.push({
            handle: fileHandle,
            name: name,
            type: 'file'
        })
    }
    fileOperateLoading.value = false
}
</script>

<template>
    <div class="wrapper" v-loading="fileOperateLoading">
        <div class="folder">
            <el-button @click="openDirectory" type="primary" size="mini" v-if="folderList.length === 0">选择目录</el-button>
            <TreeFolder @menu="clickMenu" @choose="choose" v-else :list="folderList"></TreeFolder>
        </div>
        <div class="content" :contenteditable="edit" @blur="saveContent">
            {{ content }}
        </div>
    </div>
</template>

<style>
* {
    margin: 0;
    padding: 0;
}
</style>

<style scoped lang="scss">
.wrapper {
    display: grid;
    grid-template-columns: 400px auto;
    gap: 20px;
    padding: 20px;
    box-sizing: border-box;
    height: 100vh;
    .folder,
    .content{
        box-shadow: 1px 1px 5px #ccc;
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        &:focus-within {
            outline: 1px solid #ccc;
        }
    }
}
</style>