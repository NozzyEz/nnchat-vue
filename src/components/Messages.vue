<!-- A list of messages in a conversation -->
<template>
    <div class="messages" id="messages">

        <message v-for="(message, index) in chat" :message="message" @click.native="deleteMessage(index)"/>

    </div>
</template>

<script>
    export default {
        props: ['chat'],
        methods: {
            deleteMessage(index) {
                if (confirm("Delete this message?")) {
                    // ok
                    console.log("deleting message " + index)
                    this.chat.splice(index, 1)
                } else {
                    // cancel
                }
            }
        }
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
        width: calc(100% - 20px);
        padding: 0 10px 0 10px;
        overflow-y: scroll;
        overflow-x: hidden;
        height: 100%;
    }
</style>