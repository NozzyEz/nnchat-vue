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
		this.aesjs = require('aes-js')
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
				} else this.$store.state.chats = val
			})
			get('contacts').then(val => {
				if (val === undefined) {
					console.log('stored contacts not found...')
					set('contacts', {}).then(() => {
						console.log('empty contacts list created.')
					})
				} else this.$store.state.contacts = val
			})
			get('credentials').then(val => {
				if (val === undefined) {
					console.log('stored credentials not found...')
					this.generateCredentials()
				} else {
					this.$store.state.credentials = val
					this.login()
				}
			})
		},
		// Generates credentials for the user upon the first time opening the app.
		generateCredentials() {
			let random = require('randomstring')
			let forge = require('node-forge')
			forge.prime.generateProbablePrime(1024, (err, num) => {
				this.$store.state.credentials = {
					id: random.generate(150), // random string (150 chars)
					password: random.generate(30), // random string (30 chars)
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
			this.$http
				.post(this.$store.state.apiURL + 'auth/register/', userCredentials)
				.then(
					response => {
						// If user exists
						if (
							response.body.hasOwnProperty('success') &&
							response.body.success == false
						) {
							console.log('user already exists, generating new credentials...')
							this.generateCredentials()
						}
						// Any other error, no tokens
						else if (!response.body.refresh || !response.body.access) {
							console.log('tokens not received: ')
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
					},
					error => {
						console.log('error:')
						console.log(error)
					}
				)
		},
		// TODO Write method to decrypt a message
		decryptMsg(message) {
			//* Encryption key:
			let key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
			// Create a new counter
			let aesCtr = new this.aesjs.ModeOfOperation.ctr(
				key,
				new this.aesjs.Counter(5)
			)
			// Take the encrypted message in hex and convert it to bytes
			let encryptedBytes = this.aesjs.utils.hex.toBytes(message)
			// take the bytes and decrypt them
			let decryptedBytes = aesCtr.decrypt(encryptedBytes)
			// convert the decrypted bytes to text
			let decryptedText = this.aesjs.utils.utf8.fromBytes(decryptedBytes)

			console.log(`Decrypted: ${decryptedText}`)
			return decryptedText
		},
		// Gets messages from the api, gets called periodically
		getMessages() {
			let options = {
				headers: {
					Authorization: 'Bearer ' + this.$store.state.credentials.accessToken,
				},
			}
			this.$http
				.post(
					this.$store.state.apiURL + 'receive/',
					{ last_message_id: this.$store.state.credentials.lastReceived },
					options
				)
				.then(response => {
					// If access token expires
					if (response.body.code == 'token_not_valid') {
						dispatch()
					}
					// Gets array of messages, for each message - check whether to store it
					if (
						response.body.success == true &&
						response.body.messages.length != 0
					) {
						for (let message of response.body.messages) {
							if (this.$store.state.chats.hasOwnProperty(message.sender)) {
								// TODO decrypt message.text here using this.$store.state.contacts[message.sender].key
								let decryptedMessage = this.decryptMsg(message.message)
								this.$store.state.chats[message.sender].push({
									received: true,
									content: decryptedMessage,
								})
								this.$store.state.credentials.lastReceived = message.id
							}
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
					Authorization: 'Bearer ' + this.$store.state.credentials.accessToken,
				},
			}
			this.$http
				.get(this.$store.state.apiURL + 'info/', options)
				.then(response => {
					console.log(response)
				})
				.catch(e => {
					console.log(e)
				})
		},
		// Refreshes the access token
		refreshToken() {
			let options = {
				headers: {
					'Content-Type': 'application/json',
				},
			}
			this.$http
				.post(
					this.$store.state.apiURL + 'refresh/',
					{ refresh: this.$store.state.credentials.refreshToken },
					options
				)
				.then(response => {
					let token = response.body.access
					if (token != null) {
						console.log('new access token fetched...')
						this.$store.state.credentials.accessToken = token
						set('credentials', this.$store.state.credentials).then(() => {
							console.log('token saved.')
						})
					} else {
						console.log("couldn't refresh token:")
						console.log(response)
					}
				})
				.catch(e => {
					console.log('error while refreshing token:')
					console.log(e)
				})
		},
		login() {
			let userCredentials = {
				username: this.$store.state.credentials.id,
				password: this.$store.state.credentials.password,
			}
			this.$http
				.post(this.$store.state.apiURL + 'token/', userCredentials)
				.then(
					response => {
						// Error, no tokens received
						if (!response.body.refresh || !response.body.access) {
							console.log('tokens not received: ')
							console.log(response)
						} else {
							this.$store.state.credentials.refreshToken = response.body.refresh
							this.$store.state.credentials.accessToken = response.body.access
							// Stores credentials in idb
							set('credentials', this.$store.state.credentials).then(() => {
								console.log('tokens stored.')
								// Calls getMessages() every 10 seconds
								console.log('starting to fetch messages...')
								this.$options.interval = setInterval(this.getMessages, 10000)
							})
						}
					},
					error => {
						console.log('error while logging in:')
						console.log(error)
					}
				)
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