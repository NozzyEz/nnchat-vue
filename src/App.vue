<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
    import {get, set} from 'idb-keyval'

    export default {
        data() {
            return {
                credentials: {},
                refreshToken: null, //TODO temp
                accessToken: null, //TODO temp
            }
        },
        created() {
            // this.getStoredData()

            this.getInfo()
            // let testUser = {
            //     "username": "test1",
            //     "password": "test123"
            // }
            // let options = {
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Accept": "application/json"
            //     }
            // }
            // this.$http.post(this.$store.state.apiURL + 'auth/register/', testUser).then(response => {
            //     console.log(response)
            // })

            // TODO token code
            // this.$http.post(this.$store.state.apiURL + 'token', userCredentials).then((response) => {
            //     if (!response.body.refresh || !response.body.access) {
            //         console.log("tokens not received: ")
            //         console.log(response)
            //     }
            //     else {
            //         this.refreshToken = response.body.refresh
            //         this.accessToken = response.body.access
            //         console.log(this.refreshToken)
            //         console.log(this.accessToken)
            //     }
            // }, error => {
            //     console.log(error)
            // })
        },
        methods: {
            // Gets chats, contacts and credentials from idb. If they don't exist, creates empty ones.
            getStoredData() {
                get('chats').then(val => {
                    if (val === undefined) {
                        console.log('stored chats not found...')
                        set('chats', {}).then(() => {
                            console.log('empty chats list created.')
                        })
                    }
                    else this.$store.state.chats = val
                })
                get('contacts').then(val => {
                    if (val === undefined) {
                        console.log('stored contacts not found...')
                        set('contacts', {}).then(() => {
                            console.log('empty contacts list created.')
                        })
                    }
                    else this.$store.state.contacts = val
                })
                get('credentials').then(val => {
                    if (val === undefined) {
                        console.log('stored credentials not found...')
                        this.generateCredentials()
                    }
                    else {
                        this.$store.state.credentials = val
                        // Gets messages every 10 seconds
                        console.log('starting to fetch messages...')
                        this.$options.interval = setInterval(this.getMessages, 10000)
                    }
                })
            },
            // Generates credentials for the user upon the first time opening the app.
            generateCredentials() {
                let random = require("randomstring")
                let forge = require('node-forge')
                forge.prime.generateProbablePrime(1024, (err, num) => {
                    this.credentials = {
                        id: random.generate(150), // random string (150 chars)
                        password: random.generate(30), // random string (30 chars)
                        secret: num.toString(), // large prime for generating encryption keys (1024 bits)
                        lastReceived: 0, // id of the last message received, starts at 0
                    }
                    console.log('new credentials generated.')
                    console.log(this.credentials)

                    // Registers a user with these credentials
                    this.register()

                })
            },
            register() {
                let userCredentials = {
                    username: this.credentials.id,
                    password: this.credentials.password,
                }
                this.$http.post(this.$store.state.apiURL + 'auth/register/', userCredentials).then((response) => {
                    // TODO check if user exists
                    if (response.body.message == "user exists") {
                        console.log("user already exists, generating new credentials...")
                        this.generateCredentials()
                    }
                    // Any other error, no tokens
                    else if (!response.body.refresh || !response.body.access) {
                        console.log("tokens not received: ")
                        console.log(response)
                    }
                    else {
                        // TODO handle tokens
                        this.credentials.refreshToken = response.body.refresh
                        this.credentials.accessToken = response.body.access

                        // Stores credentials in idb
                        set('credentials', this.credentials).then(() => {
                            console.log('new credentials stored.')
                            this.$store.state.credentials = this.credentials

                            // Calls getMessages() every 10 seconds
                            console.log('starting to fetch messages...')
                            this.$options.interval = setInterval(this.getMessages, 10000)
                        })
                    }
                }, error => {
                    console.log("error:")
                    console.log(error)
                })
            },
            // Gets messages from the api, gets called periodically
            // TODO make this fetch something proper, fix CORS
            getMessages() {
                this.$http.get(this.$store.state.apiURL + 'messages').then(response => {
                    console.log(response)

                    // for (let message in response) {
                    //     console.log(message)
                    // }
                })
            },
            getInfo() {
                let options = {
                    headers: {
                        "Authorization": "Bearer " + this.$store.state.credentials.accessToken
                    }
                }
                this.$http.get(this.$store.state.apiURL + 'info', options).then(response => {
                    console.log(response)
                }).catch(e => {
                    console.log(e)
                })
            }
        },
    }
</script>

<style>
    @import './css/animate.min.css';
    @import './css/style.css';

    #app {
        overflow: hidden;
    }
</style>
