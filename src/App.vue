<template>
  <div id="app">
    <LocalEdit ignore="node_modules|public"></LocalEdit>
  </div>
</template>

<script>

import {LocalEdit} from "../packages";

export default {
  name: 'App',
  components: {
      LocalEdit
  }
}
</script>

<style>

</style>
