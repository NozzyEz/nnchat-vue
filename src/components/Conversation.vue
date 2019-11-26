<!-- The conversation with a single contact shown in the middle -->
<template>
    <div>

        <!-- Name of the contact at the top -->
        <div class="user-wrapper row middle-xs">
            <div class="col-xs" v-if="$store.state.selectedChat">
                {{$store.state.contacts[$store.state.selectedChat].name}}
            </div>
            <div v-if="!$store.state.canConnect" class="col-xs end-xs error">
                Connection lost
            </div>
        </div>

        <!-- Messages of the conversation -->
        <div class="messages-wrapper">
            <messages v-if="$store.state.selectedChat" :chat="$store.state.chats[$store.state.selectedChat]"/>
        </div>

        <!-- Input field for sending messages -->
        <div class="input-wrapper row middle-xs">
            <div class="col-xs">
                <input class="input-field" type="text" v-model="message" @keydown.enter="sendMessage">
            </div>
        </div>

    </div>
</template>

<script>
    import {get, set} from 'idb-keyval'

    export default {
        data() {
            return {
                message: "",
            }
        },
        methods: {
            // Sends a message
            sendMessage() {
                if (this.message.length == 0 || this.$store.state.selectedChat == null) return
                // Post request for sending the message
                let options = {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.state.credentials.accessToken
                    }
                }
                // TODO encrypt message here using this.$store.state.contacts[this.$store.state.selectedChat].key
                this.$http.post(
                    this.$store.state.apiURL + 'send/',
                    {
                        receiver: this.$store.state.selectedChat,
                        message: this.message
                    },
                    options
                ).then((response) => {
                    console.log("message sent.")
                    console.log(response.body)
                }, error => {
                    console.log(error)
                })

                // Stores the message locally
                this.$store.state.chats[this.$store.state.selectedChat].push({received: false, content: this.message})
                set('chats', this.$store.state.chats).then(() => {
                    // scroll down to see the new message
                    let mesDiv = document.getElementById("messages")
                    mesDiv.scrollTop = mesDiv.scrollHeight
                })

                // clear input
                this.message = ""
            }
        }
    }
</script>

<style scoped>
    .user-wrapper {
        height: 50px;
        border-bottom: gray 1px solid;
        font-weight: bold;
        font-size: 20px;
        padding: 10px;
    }
    .messages-wrapper {
        height: calc(100vh - 100px);
        overflow: hidden;
    }
    .input-wrapper {
        border-top: gray 1px solid;
        height: 50px;
    }
    .input-field {
        width: calc(100% - 30px);
        border-radius: 10px;
        padding: 10px;
        background-color: lightgray;
        border: 0;
        margin: 5px;
    }
    .error {
        color: red;
    }
</style>
