<!-- A single chat/contact in the list of the Chats component -->
<template>
    <div class="chat-item row middle-xs" @click="selectChat">

        <!-- Name of the contact -->
        <div class="user col-xs-12">
            {{$store.state.contacts[contact].name}}
        </div>

        <!-- Last message in the chat -->
        <div class="last-message col-xs-12" v-if="$store.state.chats[contact].length != 0">
            {{$store.state.chats[contact][$store.state.chats[contact].length-1].content}}
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
                this.$store.state.contactsVisible = false
                this.$cookies.set('selectedChat', this.$store.state.selectedChat)
            },
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .last-message {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
