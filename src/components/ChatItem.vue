<template>
    <div class="chat-item row middle-xs" @click="selectChat">

        <div class="user col-xs-12">
            {{$store.state.contacts[contact].name}}
<!--            {{contact.name}}-->
        </div>

        <div class="last-message col-xs-12">
            hash={{contact}} key={{$store.state.contacts[contact].key}}
<!--            {{contact.key}}-->
        </div>

    </div>
</template>

<script>
    export default {
        props: ['contact'],
        methods: {
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
</style>
