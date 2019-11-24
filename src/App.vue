<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import { get, set } from 'idb-keyval'

    export default {
        data() {
            return {
                credentials: {},
            }
        },
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
            getMessages() {
                this.$http.get(this.$store.state.apiURL + 'messages').then(response => {
                	// Gets array of messages, for each message - check whether to store it
                    for (let message of response.body) {
						if (this.$store.state.chats.hasOwnProperty(message.sender)) {
							// TODO decrypt message.text here using this.$store.state.contacts[message.sender].key
							this.$store.state.chats[message.sender].push({
								received: true,
								content: message.text
							})
							this.$store.state.credentials.lastReceived = message.id
						}
                    }
                    // Save messages and lastReceived in idb
					set('chats', this.$store.state.chats).then(() => {
						console.log('chats saved.')
					})
					set('credentials', this.$store.state.credentials).then(() => {
						console.log('credentials saved.')
					})
                })
            },
			// Gets user info by providing a token
            getInfo() {
                let options = {
                    headers: {
                        "Authorization": "Bearer " + this.$store.state.credentials.accessToken
                    }
                }
                this.$http.get(this.$store.state.apiURL + 'info/', options).then(response => {
                    console.log(response)
                }).catch(e => {
                    console.log(e)
                })
            },
			// Refreshes the access token
			refreshToken() {
            	let options = {
            		headers: {
            			'Content-Type': 'application/json'
					}
				}
				this.$http.post(this.$store.state.apiURL + 'refresh/', {refresh: this.$store.state.credentials.refreshToken}, options).then(response => {
					let token = response.body.access
					if (token != null) {
						console.log("new access token fetched...")
						this.$store.state.credentials.accessToken = token
						set('credentials', this.$store.state.credentials).then(() => {
							console.log('token saved.')
						})
					}
					else {
						console.log("couldn't refresh token:")
						console.log(response)
					}
				}).catch(e => {
					console.log("error while refreshing token:")
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
