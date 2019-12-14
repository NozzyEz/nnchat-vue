<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
export default {
	created() {
		this.getStoredData()
		this.$store.state.selectedChat = this.$cookies.get('selectedChat')
	},
	methods: {
		// Gets chats, contacts and credentials from idb. If they don't exist, creates empty ones.
		getStoredData() {
			this.$idbGet('chats').then(val => {
				if (val === undefined) {
					console.log('stored chats not found...')
					this.$idbSet('chats', {}).then(() => {
						console.log('empty chats list created.')
					})
				} else this.$store.state.chats = val
			})
			this.$idbGet('contacts').then(val => {
				if (val === undefined) {
					console.log('stored contacts not found...')
					this.$idbSet('contacts', {}).then(() => {
						console.log('empty contacts list created.')
					})
				} else this.$store.state.contacts = val
			})
			this.$idbGet('credentials').then(val => {
				if (val === undefined) {
					console.log('stored credentials not found...')
					this.generateCredentials()
				} else {
					this.$store.state.credentials = val
					// Calls getMessages() every 5 seconds
					console.log('starting to fetch messages...')
					this.$options.interval = setInterval(this.getMessages, 5000)
				}
			})
		},
		// Generates credentials for the user upon the first time opening the app.
		generateCredentials() {
			this.$store.state.credentials = {
				id: this.$randomString.generate(150), // random string (150 chars)
				password: this.$randomString.generate(30), // random string (30 chars)
				secret: this.generateSecret(), // large random number for generating encryption keys (1024 bits)
				lastReceived: 0, // id of the last message received, starts at 0
			}
			console.log('new credentials generated.')
			// Registers a user with these credentials
			this.register()
		},
		// Generates a random 1024 byte number
		generateSecret() {
			let array = new Uint32Array(32)
			let nums = window.crypto.getRandomValues(array)
			let secret = ""
			for (let num of nums) {
				secret += num
			}
			return secret
		},
		// Registers a new account with credentials
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
							this.$idbSet('credentials', this.$store.state.credentials).then(() => {
								console.log('new credentials stored.')

								// Calls getMessages() every 5 seconds
								console.log('starting to fetch messages...')
								this.$options.interval = setInterval(this.getMessages, 5000)
							})
						}
					},
					error => {
						console.log('error:')
						console.log(error)
					}
				)
		},
		// This method is to generate an encryption key from the shared key, this is not directly
		// for security, but an easy way to ensure a 128bit key to pass to AES
		generateKey(seed) {
			// First create a hash from the shared key
			let hash = this.$sha2(seed)

			// Next create a 8-bit array of unsigned ints
			let generatedHash = Uint8Array.from(hash)
			let generatedKey = []

			// Then shorten it down to the first 16 bytes
			for (let index = 0; index < 16; index++) {
				generatedKey[index] = generatedHash[index]
			}

			// Return that array as a key for AES
			return generatedKey
		},
		decryptMsg(message, sender) {
			//* Encryption key:
			let key = this.generateKey(
				this.$store.state.contacts[sender].key
			)
			// Create a new counter
			let aesCtr = new this.$aes.ModeOfOperation.ctr(
				key,
				new this.$aes.Counter(5)
			)
			// Take the encrypted message in hex and convert it to bytes
			let encryptedBytes = this.$aes.utils.hex.toBytes(message)
			// take the bytes and decrypt them
			let decryptedBytes = aesCtr.decrypt(encryptedBytes)
			// convert the decrypted bytes to text
			let decryptedText = this.$aes.utils.utf8.fromBytes(decryptedBytes)

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
				.then(
					response => {
						this.$store.state.canConnect = true
						console.log(response.body.messages.length + " messages fetched")
						console.log(response.body.messages)
						// Gets array of messages, for each message - check whether to store it
						if (
							response.body.success == true &&
							response.body.messages.length != 0
						) {
							for (let message of response.body.messages) {
								// If the user has that contact
								if (this.$store.state.chats.hasOwnProperty(message.sender)) {
									// Decrypt the message
									let decryptedMessage = this.decryptMsg(message.message, message.sender)
									// Save the message
									this.$store.state.chats[message.sender].push({
										received: true,
										content: decryptedMessage,
									})
									// Set the seen value
									this.$store.state.contacts[message.sender].seen = message.sender == this.$store.state.selectedChat
								}
							}
							// Update the last received message ID
							this.$store.state.credentials.lastReceived = response.body.messages[response.body.messages.length-1].id
						}
						// Save messages and lastReceived in idb
						this.$idbSet('chats', this.$store.state.chats).then(() => {
							// scroll down to see the new message
							let mesDiv = document.getElementById('messages')
							if (mesDiv != null) mesDiv.scrollTop = mesDiv.scrollHeight
							this.$idbSet('credentials', this.$store.state.credentials)
						})
					},
					error => {
						console.log('error getting messages:')
						// If access token expires
						if (error.body.code == 'token_not_valid') {
							console.log('Token expired.')
							this.$store.dispatch('refreshToken')
						} else if (error.ok == false) {
							console.log("can't connect")
							this.$store.state.canConnect = false
						} else {
							console.log(error)
						}
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