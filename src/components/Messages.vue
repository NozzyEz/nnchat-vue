<template>
    <div class="messages">

        <message v-for="message in chat" :message="message"/>

    </div>
</template>

<script>
    export default {
        props: ['chat']
    }
</script>

<style scoped>
    .messages {
        padding: 10px;
    }
</style>