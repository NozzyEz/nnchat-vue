<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import { get, set } from 'idb-keyval'

    export default {
        created() {
            this.getStoredData()
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

						// Calls getMessages() every 10 seconds
						console.log('starting to fetch messages...')
						this.$options.interval = setInterval(this.getMessages, 10000)
                    }
                })
            },
            // Generates credentials for the user upon the first time opening the app.
            generateCredentials() {
                this.$forge.prime.generateProbablePrime(1024, (err, num) => {
                    this.$store.state.credentials = {
                        id: this.$randomString.generate(150), // random string (150 chars)
                        password: this.$randomString.generate(30), // random string (30 chars)
                        secret: num.toString(), // large prime for generating encryption keys (1024 bits)
                        lastReceived: 0, // id of the last message received, starts at 0
                    }
                    console.log('new credentials generated.')

                    // Registers a user with these credentials
                    this.register()

                })
            },
            register() {
                let userCredentials = {
                    username: this.$store.state.credentials.id,
                    password: this.$store.state.credentials.password,
                }
                this.$http.post(this.$store.state.apiURL + 'auth/register/', userCredentials).then((response) => {
                    // If user exists
                    if (response.body.hasOwnProperty('success') && response.body.success == false) {
                        console.log("user already exists, generating new credentials...")
                        this.generateCredentials()
                    }
                    // Any other error, no tokens
                    else if (!response.body.refresh || !response.body.access) {
                        console.log("tokens not received: ")
                        console.log(response)
                    }
                    // Success
                    else {
                        this.$store.state.credentials.refreshToken = response.body.refresh
                        this.$store.state.credentials.accessToken = response.body.access

                        // Stores credentials in idb
                        set('credentials', this.$store.state.credentials).then(() => {
                            console.log('new credentials stored.')

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
            getMessages() {
				let options = {
					headers: {
						'Authorization': 'Bearer ' + this.$store.state.credentials.accessToken
					}
				}
                this.$http.post(this.$store.state.apiURL + 'receive/', {'last_message_id': this.$store.state.credentials.lastReceived}, options).then(response => {
					this.$store.state.canConnect = true
					// Gets array of messages, for each message - check whether to store it
					if (response.body.success == true && response.body.messages.length != 0) {
						for (let message of response.body.messages) {
							if (this.$store.state.chats.hasOwnProperty(message.sender)) {
								// TODO decrypt message.text here using this.$store.state.contacts[message.sender].key
								this.$store.state.chats[message.sender].push({
									received: true,
									content: message.message
								})
								this.$store.state.credentials.lastReceived = message.id
							}
						}
					}
                    // Save messages and lastReceived in idb
					set('chats', this.$store.state.chats)
					set('credentials', this.$store.state.credentials)

                }, error => {
					console.log("error getting messages:")
					// If access token expires
					if (error.body.code == "token_not_valid") {
						console.log("Token expired.")
						this.$store.dispatch('refreshToken')
					}
					else if (error.ok == false) {
						console.log("can't connect")
						this.$store.state.canConnect = false
					}
					else {
						console.log(error)
					}
				})
            },
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
