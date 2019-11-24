<!-- A list of messages in a conversation -->
<template>
    <div class="messages" id="messages">

        <message v-for="message in chat" :message="message"/>

    </div>
</template>

<script>
    export default {
        props: ['chat']
    }
</script>

<style scoped>
    @media only screen and (max-width: 767px) {
        .messages {
            width: calc(100% - 25px) !important;
            padding: 0 15px 0 10px !important;
        }
    }
    .messages {
        width: 100%;
        padding: 0 17px 0 10px;
        overflow-y: scroll;
        overflow-x: hidden;
        height: 100%;
        box-sizing: content-box;
    }
</style>