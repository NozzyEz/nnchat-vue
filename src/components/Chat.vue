<!-- A single chat/contact in the list of the Chats component -->
<template>
    <div class="chat-item row middle-xs"
         @click="selectChat"
         @dblclick="editContact"
         v-long-press="500"
         @long-press-start="deleteContact">

        <!-- Name of the contact -->
        <div class="user col-xs-12">
            {{$store.state.contacts[contact].name}}
        </div>

        <!-- Last message in the chat -->
        <div class="last-message col-xs-12" v-if="$store.state.chats[contact].length != 0" :class="{'unread': !$store.state.contacts[contact].seen}">
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
                this.$store.state.contacts[this.contact].seen = true
                this.$cookies.set('selectedChat', this.$store.state.selectedChat)
                this.$idbSet('contacts', this.$store.state.contacts)
            },
            // Opens an alert window to edit a contact name
            editContact() {
                let name = prompt("Contact name:", this.$store.state.contacts[this.contact].name)
                if (name == null || name == "") {
                    // Cancel
                    console.log("rename canceled.")
                } else {
                    // Ok
                    // Saves the new name
                    this.$store.state.contacts[this.contact].name = name
                    this.$idbSet('contacts', this.$store.state.contacts)
                }
            },
            // Opens an alert window to delete a contact
            deleteContact() {
                if (confirm("Delete contact: " + this.$store.state.contacts[this.contact].name + "?")) {
                    // Ok
                    console.log("deleting contact: " + this.$store.state.contacts[this.contact].name)
                    // Deleting the user from contacts and chats in store
                    this.$delete(this.$store.state.contacts, this.contact)
                    this.$delete(this.$store.state.chats, this.contact)
                    // Saving contacts and chats in idb
                    this.$idbSet('contacts', this.$store.state.contacts)
                    this.$idbSet('chats', this.$store.state.chats)
                } else {
                    // Cancel
                    console.log("delete canceled.")
                }
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .last-message {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .unread {
        font-weight: bold;
    }
</style>
