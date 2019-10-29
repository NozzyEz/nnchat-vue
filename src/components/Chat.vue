<template>
    <div>

        <div class="user-wrapper row middle-xs">
            <div class="col-xs">
                {{$store.state.contacts[$store.state.selectedChat].name}}
            </div>
        </div>

        <div class="messages-wrapper">
            <messages :chat="$store.state.chats[$store.state.selectedChat]"/>
        </div>

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
            sendMessage() {
                // send the message

                this.$store.state.chats[this.$store.state.selectedChat].push({received: false, content: this.message})

                set('chats', this.$store.state.chats).then(() => {
                    //
                })

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
</style>
