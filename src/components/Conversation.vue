<!-- The conversation with a single contact shown in the middle -->
<template>
	<div>
		<!-- Name of the contact at the top -->
		<div class="user-wrapper row middle-xs no-select">
			<div class="col-xs-1" v-if="$mq === 'sm'" @click="$store.state.contactsVisible = true">
				☰
			</div>
			<div class="col-xs" v-if="chatSelected">
				{{ $store.state.contacts[$store.state.selectedChat].name }}
			</div>
			<div v-if="!$store.state.canConnect" class="col-xs end-xs error">
				Connection lost
			</div>
		</div>

		<!-- Messages of the conversation -->
		<div class="messages-wrapper">
			<messages
				v-if="chatSelected"
				:chat="$store.state.chats[$store.state.selectedChat]"
			/>
		</div>
		<!-- Input field for sending messages -->
		<div class="input-wrapper row middle-xs">
			<div class="col-xs">
				<input
					class="input-field"
					type="text"
					v-model="message"
					@keydown.enter="sendMessage"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			message: '',
		}
	},
	computed: {
		chatSelected() {
			return this.$store.state.selectedChat != null
					&& this.$store.state.contacts.hasOwnProperty(this.$store.state.selectedChat)
		}
	},
	methods: {
		// Sends a message
		sendMessage() {
			if (this.message.length == 0 || this.$store.state.selectedChat == null) return

			// Stores the message locally
			this.$store.state.chats[this.$store.state.selectedChat].push({
				received: false,
				content: this.message,
			})
			this.$idbSet('chats', this.$store.state.chats).then(() => {
				// scroll down to see the new message
				let mesDiv = document.getElementById('messages')
				mesDiv.scrollTop = mesDiv.scrollHeight
			})

			// Post request for sending the encrypted message
			let encryptedMessage = this.encryptMsg(this.message)
			this.postMessage(encryptedMessage, this.$store.state.selectedChat)

			// clear input
			this.message = ''
		},
		// Sends the post request for the message
		postMessage(message, receiver) {
			let options = {
				headers: {
					Authorization: 'Bearer ' + this.$store.state.credentials.accessToken,
				},
			}
			this.$http
					.post(
							this.$store.state.apiURL + 'send/',
							{
								receiver: receiver,
								message: message,
							},
							options
					)
					.then(
							response => {
								console.log('message sent.')
								console.log(response.body)
							},
							error => {
								console.log(error)
								// Since there's an error, try to refresh the token and post again
								this.$store.dispatch('refreshToken').then(response => {
									this.postMessage(message, receiver)
								}, error => {
									console.log("couldn't refresh token while sending message.")
								})
							}
					)
		},
		// Generate 128bit key as array from the generated DH key
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
		encryptMsg(message) {
			console.log(`original message: ${message}`)

			let key = this.generateKey(
				this.$store.state.contacts[this.$store.state.selectedChat].key
			)
			//* An example 128-bit key
			// let key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

			// Convert the message to bytes
			let textBytes = this.$aes.utils.utf8.toBytes(message)

			//* Setup our encryption mode
			let aesCtr = new this.$aes.ModeOfOperation.ctr(
				key,
				new this.$aes.Counter(5)
			)
			//* Encrypt and convert to hex
			let encryptedBytes = aesCtr.encrypt(textBytes)
			let encryptedHex = this.$aes.utils.hex.fromBytes(encryptedBytes)
			console.log(`encrypted: ${encryptedHex}`)
			// TODO end of encryption
			return encryptedHex
		},
	},
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
