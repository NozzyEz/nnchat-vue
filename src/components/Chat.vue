<!-- A single chat/contact in the list of the Chats component -->
<template>
    <div class="chat-item row middle-xs" @click="selectChat">

        <!-- Name of the contact -->
        <div class="user col-xs-12">
            {{$store.state.contacts[contact].name}}
        </div>

        <!-- TODO temp, id and key of the contact -->
        <div class="last-message col-xs-12">
            id={{contact}} key={{$store.state.contacts[contact].key}}
        </div>

    </div>
</template>

<script>
    export default {
        props: ['contact'],
        methods: {
            // Selects the chat to be one shown in the middle of the screen
            selectChat() {
                this.$store.state.selectedChat = this.contact
            }
        }
    }
</script>

<style scoped>
    .chat-item {
        height: 60px;
        border-bottom: 1px solid gray;
        padding: 10px;
    }
    .user {
        font-weight: bold;
    }
    .last-message {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
