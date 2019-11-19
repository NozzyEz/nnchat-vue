<!-- A single message in the conversation, differently styled if the message was received or sent -->
<template>
    <div class="message-wrapper row" :class="[message.received ? 'start-xs' : 'end-xs']">

        <div class="message" :class="[message.received ? 'received' : 'sent']">
            {{message.content}}
        </div>

    </div>
</template>

<script>
    export default {
        props: ['message']
    }
</script>

<style scoped>
    .message-wrapper {
        margin: 10px;
    }
    .message {
        padding: 10px;
        border-radius: 10px;
        border: 0;
    }
    .received {
        background-color: lightgray;
    }
    .sent {
        border: 1px gray solid;
    }

</style>
