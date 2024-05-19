<script setup>
import {defineProps, defineEmits} from 'vue'

const props = defineProps({
    parentIndex: {
        type: Number,
        default: 0
    },
    list: {
        type: Array,
        default: () => []
    },
    menuMap: {
        type: Map,
        default: () => new Map()
    }
})
const emit = defineEmits(['choose', 'clickMenu'])
const foldContainer = container => {
    if (!container) return
    const { height } = container.getBoundingClientRect()
    if (height === 0) {
        // 展开
        container.style.height = 'auto'
        const { height } = container.getBoundingClientRect()
        container.style.height = '0'
        container.getBoundingClientRect()
        container.style.height = `${height}px`
        setTimeout(() => {
            container.style.height = 'auto'
        },300)
    } else {
        // 收起
        if (!container.style.height || container.style.height === 'auto') container.style.height = `${height}px`
        container.getBoundingClientRect()
        container.style.height = 0
    }
}
const chooseNode = (item, event) => {
    if (item.type === 'directory') {
        // 展开收起
        const dom = event.currentTarget
        if (dom.nextElementSibling) {
            if (dom.nextElementSibling.className.includes('container')) {
                foldContainer(dom.nextElementSibling)
            }
        }
    } else {
        emit('choose', item)
    }
}
const showMenu = (item, event) => {
    if (item.type === 'file') return
    const menu = [...event.currentTarget.childNodes].find(item => item.className && item.className.includes('context-menu'))
    if (!menu) return
    if (props.menuMap.has(menu)) return
    menu.classList.add('show')
    menu.style.left = event.x + 'px'
    menu.style.top = event.y + 'px'
    props.menuMap.set(menu, item)
}
document.onmousedown = e => {
    if (props.menuMap.size === 0) return
    if (e.target.className.includes('context-menu')) {
        if (props.menuMap.get(e.target)) return
    }
    const [curMenu] = props.menuMap.keys()
    curMenu.classList.remove('show')
    props.menuMap.clear()
}
const clickMenu = (menu, item) => {
    emit('menu', {
        menu,
        item
    })
}
</script>

<template>
    <div class="container">
        <div class="item" v-for="(item, index) of props.list" :key="`${parentIndex}-${index}`" @click.right.stop.prevent="showMenu(item, $event)">
            <div :class="item.type" @click="chooseNode(item, $event)">
                <svg v-if="item.type === 'directory'" t="1716027769651" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3500" width="16" height="16"><path d="M853.333333 256H469.333333l-85.333333-85.333333H170.666667c-46.933333 0-85.333333 38.4-85.333334 85.333333v170.666667h853.333334v-85.333334c0-46.933333-38.4-85.333333-85.333334-85.333333z" fill="#FFA000" p-id="3501"></path><path d="M853.333333 256H170.666667c-46.933333 0-85.333333 38.4-85.333334 85.333333v426.666667c0 46.933333 38.4 85.333333 85.333334 85.333333h682.666666c46.933333 0 85.333333-38.4 85.333334-85.333333V341.333333c0-46.933333-38.4-85.333333-85.333334-85.333333z" fill="#FFCA28" p-id="3502"></path></svg>
                <svg v-if="item.type === 'file'" t="1716027872076" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7218" width="16" height="16"><path d="M853.333333 960H170.666667V64h469.333333l213.333333 213.333333z" fill="#90CAF9" p-id="7219"></path><path d="M821.333333 298.666667H618.666667V96z" fill="#E1F5FE" p-id="7220"></path></svg>
                <div class="name">
                    {{ item.name }}
                </div>
            </div>
            <TreeFolder v-on="$listeners" v-if="item.children && item.children.length" :list="item.children" :menu-map="props.menuMap" :parent-index="index"></TreeFolder>
            <div class="context-menu">
                <div class="menu-item" v-for="menu of (item.menu || [])" :key="menu.key" @click.stop="clickMenu(menu, item)">{{ menu.label }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    padding-left: 20px;
    transition: height 0.3s;
    overflow: hidden;
    .item {
        .directory,
        .file {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 5px;
            &:hover {
                background: #66b1ff;
                border-color: #66b1ff;
                color: #fff;
            }
            .name {
                margin-left: 10px;
            }
        }
        .context-menu {
            box-shadow: 1px 1px 3px #ccc;
            position: fixed;
            top: 0;
            left: 0;
            height: 0;
            overflow: hidden;
            transition: height 1s;
            background: white;
            cursor: pointer;
            border-radius: 5px;
            .menu-item {
                height: 30px;
                line-height: 30px;
                padding: 0 15px;
                transition: all 0.2s;
                font-size: 12px;
                &:hover {
                    background: #97c3f8;
                    color: #fff;
                }
            }
            &.show {
                height: 60px;
            }
        }
    }
}
</style>