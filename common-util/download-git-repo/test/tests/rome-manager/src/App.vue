<template>
  <div>
    {{ message }}
  </div>
</template>
<script>

export default {
  data() {
    return {
      message: "hello world"
    };
  },
  methods: {},
  mounted() {
    console.log("mounted");
  }
};
</script>
<style lang="scss"></style>
