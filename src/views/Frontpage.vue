<template>
    <div>

        <div class="row">
            <div class="col-xs-2">
                <chats/>
            </div>
            <div class="col-xs-8">
                <chat/>
            </div>
        </div>

    </div>
</template>

<script>
    import {get, set} from 'idb-keyval'

    export default {
        data() {
            return {
                contacts: { // TODO temp
                    'abcdefg': {
                        name: 'Kris',
                        key: 'key123'
                    },
                    'hijklmn': {
                        name: 'Mark',
                        key: 'key456'
                    }
                },
                chats: { // TODO temp
                    'abcdefg': [],
                    'hijklmn': [],
                }
            }
        },
        created() {
            this.getData()
            this.$store.state.contacts = this.contacts
        },
        methods: {
            getData() {
                get('chats').then(val => {
                    if (val === undefined) {
                        console.log('stored chats not found...')
                        set('chats', this.chats).then(() => {
                            console.log('empty chats list created.')
                            this.$store.state.chats = this.chats
                        })
                    }
                    else this.$store.state.chats = val
                })
                get('credentials').then(val => {
                    if (val === undefined) {
                        console.log('stored credentials not found...')
                        set('credentials', this.generateCredentials()).then(() => {
                            console.log('new credentials generated.')
                            this.$store.state.credentials = this.credentials
                        })
                    }
                    else this.$store.state.credentials = val
                })
                get('contacts').then(val => {
                    if (val === undefined) {
                        console.log('stored contacts not found...')
                        set('contacts', this.contacts).then(() => {
                            console.log('empty contacts list created.')
                            this.$store.state.contacts = this.contacts
                        })
                    }
                    else this.$store.state.contacts = val
                })
            },
            generateCredentials() {
                // TODO generate proper random hashed credentials
                return {hash: 'myhash', pass: 'mypass'}
            }
        },

    }
</script>
