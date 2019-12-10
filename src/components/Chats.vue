<!-- A list of all chats/contacts on the left -->
<template>
    <div class="chats">

        <!-- Button for adding a new contact -->
        <div class="add-contact row middle-xs no-select">
            <div class="col-xs-11 start-xs" @click="showWindow">
                ✚ Add New Contact
            </div>
            <div v-if="$mq === 'sm'" class="col-xs-1 end-xs" @click="closeWindow">
                ⛌
            </div>
        </div>

        <!-- A list of all chats/contacts -->
        <div class="chat-items no-select">
            <chat v-for="(value, contact) in $store.state.contacts" :contact="contact" :class="{'selected': contact == $store.state.selectedChat}"/>
        </div>

        <div class="delete-wrapper row middle-xs center-xs" @click="deleteData">
            <div class="col-xs no-select">
                Delete all data
            </div>
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
            },
            // Shows an alert window to delete all local data (chats, contacts, credentials)
            deleteData() {
                if (confirm("Delete all local data?")) {
                    // ok
                    console.log("deleting all data")
                    this.$store.state.selectedChat = null
                    this.$store.state.contacts = {}
                    this.$store.state.chats = {}
                    this.$store.state.credentials = {}
                    this.$idbDel('contacts')
                    this.$idbDel('chats')
                    this.$idbDel('credentials')
                } else {
                    // cancel
                    console.log("delete canceled")
                }
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
        height: calc(100vh - 100px);
        padding: 0 17px 0 0;
        overflow-y: scroll;
        overflow-x: hidden;
        box-sizing: content-box;
    }
    .selected {
        background: #eeeeee;
    }
    .delete-wrapper {
        height: 50px;
        color: darkred;
        border-top: 1px solid gray;
    }
    @media (max-width: 767px) {
        .chat-items {
            height: calc(100vh - 100px - 56px) !important;
        }
    }
</style>