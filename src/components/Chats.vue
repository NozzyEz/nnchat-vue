<!-- A list of all chats/contacts on the left -->
<template>
    <div class="chats">

        <!-- Button for adding a new contact -->
        <div class="add-contact row middle-xs">
            <div class="col-xs-11 start-xs" @click="showWindow">
                + Add New Contact
            </div>
            <div v-if="$mq === 'sm'" class="col-xs-1 end-xs" @click="closeWindow">
                X
            </div>
        </div>

        <!-- A list of all chats/contacts -->
        <div class="chat-items">
            <chat v-for="(value, contact) in $store.state.contacts" :contact="contact" :class="{'selected': contact == $store.state.selectedChat}"/>
        </div>

    </div>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        methods: {
            showWindow() {
                this.$store.state.addContactVisible = true
            },
            closeWindow() {
                this.$store.state.contactsVisible = false
            }
        }
    }
</script>

<style scoped>
    .chats {
        height: 100vh;
        overflow: hidden;
        width: 100%;
    }
    .add-contact {
        height: 50px;
        border-bottom: 1px solid gray;
        padding: 10px;
        background: lightgray;
        font-weight: bold;
    }
    .chat-items {
        width: calc(100% + 17px);
        height: 100%;
        padding: 0 17px 0 0;
        overflow-y: scroll;
        overflow-x: hidden;
        box-sizing: content-box;
    }
    .selected {
        background: #eeeeee;
    }
</style>