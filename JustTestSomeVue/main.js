
// main.js
const { createApp, ref } = Vue;

const vm = createApp({
    setup() {
        const message = ref('Hello Vue 3.0!');
        return {
            message
        }
    },
});
// mount
vm.mount('#App');
