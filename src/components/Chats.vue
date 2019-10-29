<template>
    <div class="chats">

        <div class="add-contact row middle-xs" @click="addContact">
            <div class="col-xs start-xs">
                Add Contact
            </div>
            <div class="col-xs end-xs">
                +
            </div>
        </div>

        <chat-item v-for="(value, contact) in $store.state.contacts" :contact="contact"/>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                contact: {
                    name: 'Cata',
                    key: 'key789'
                }
            }
        },
        methods: {
            addContact() {
                // this.$store.state.contacts['opqrstu'] = this.contact
                this.$set(this.$store.state.contacts, 'opqrstu', this.contact)
                console.log(this.$store.state.contacts)
            }
        }
    }
</script>

<style scoped>
    .chats {
        border-right: 1px gray solid;
        height: 100vh;
    }
    .add-contact {
        height: 50px;
        border-bottom: 1px solid gray;
        padding: 10px;
        background: lightgray;
        font-weight: bold;
    }
</style>